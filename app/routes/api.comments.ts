import { data } from "react-router";
import type { Route } from "./+types/api.comments";
import { getCurrentUserId } from "~/lib/session";
import { parseFormData } from "~/lib/validation";
import { commentContentSchema } from "~/lib/comment-validation";
import { canEditComment } from "~/lib/comment-permissions";
import { isUserEnrolled } from "~/services/enrollmentService";
import {
  createComment,
  editComment,
  getCommentById,
  getCourseIdForLesson,
} from "~/services/commentService";

// Resource route for comment mutations (see ADR-0004). Dispatches on intent.
// Enrollment and ownership are always re-checked here server-side — never trust
// the client (see ADR-0005).
export async function action({ request }: Route.ActionArgs) {
  const currentUserId = await getCurrentUserId(request);
  if (!currentUserId) {
    throw data("You must be logged in to comment", { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "post-comment") {
    const lessonId = Number(formData.get("lessonId"));
    if (!Number.isInteger(lessonId)) {
      throw data("Invalid lesson", { status: 400 });
    }

    // Resolve the owning course and gate on enrollment.
    const courseId = getCourseIdForLesson(lessonId);
    if (courseId === null) {
      throw data("Lesson not found", { status: 404 });
    }
    if (!isUserEnrolled(currentUserId, courseId)) {
      throw data("You must be enrolled to comment", { status: 403 });
    }

    const parsed = parseFormData(formData, commentContentSchema);
    if (!parsed.success) {
      return { success: false as const, error: parsed.errors.content };
    }

    createComment(currentUserId, lessonId, parsed.data.content);
    return { success: true as const };
  }

  if (intent === "edit-comment") {
    const commentId = Number(formData.get("commentId"));
    if (!Number.isInteger(commentId)) {
      throw data("Invalid comment", { status: 400 });
    }

    const comment = getCommentById(commentId);
    if (!comment) {
      throw data("Comment not found", { status: 404 });
    }
    if (!canEditComment(comment, currentUserId)) {
      throw data("You can only edit your own comment", { status: 403 });
    }

    const parsed = parseFormData(formData, commentContentSchema);
    if (!parsed.success) {
      return { success: false as const, error: parsed.errors.content };
    }

    editComment(commentId, parsed.data.content);
    return { success: true as const };
  }

  throw data("Unknown intent", { status: 400 });
}
