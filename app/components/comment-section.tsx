import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { UserAvatar } from "~/components/user-avatar";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { formatRelativeTime, isEdited } from "~/lib/utils";
import { canEditComment } from "~/lib/comment-permissions";
import { MAX_COMMENT_LENGTH } from "~/lib/comment-validation";
import type { CommentWithAuthor } from "~/services/commentService";

type CommentSectionProps = {
  lessonId: number;
  comments: CommentWithAuthor[];
  enrolled: boolean;
  instructorId: number;
  currentUserId: number | null;
};

export function CommentSection({
  lessonId,
  comments,
  enrolled,
  instructorId,
  currentUserId,
}: CommentSectionProps) {
  const fetcher = useFetcher<{ success: boolean; error?: string }>();
  const formRef = useRef<HTMLFormElement>(null);
  const isPosting =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === "post-comment";

  // Non-optimistic feedback (see ADR-0005): clear the box on success, toast on error.
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        formRef.current?.reset();
      } else if (fetcher.data.error) {
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.state, fetcher.data]);

  const now = new Date();

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">
          Discussion
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {comments.length}
            </span>
          )}
        </h2>
      </div>

      {enrolled ? (
        <fetcher.Form
          ref={formRef}
          method="post"
          action="/api/comments"
          className="mb-8"
        >
          <input type="hidden" name="intent" value="post-comment" />
          <input type="hidden" name="lessonId" value={lessonId} />
          <Textarea
            name="content"
            placeholder="Add a comment…"
            rows={3}
            maxLength={MAX_COMMENT_LENGTH}
            required
            className="mb-2"
          />
          <Button type="submit" disabled={isPosting}>
            {isPosting ? "Posting…" : "Post comment"}
          </Button>
        </fetcher.Form>
      ) : (
        <p className="mb-8 text-sm text-muted-foreground">
          Enroll in this course to join the discussion.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. {enrolled && "Be the first to comment!"}
        </p>
      ) : (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              instructorId={instructorId}
              currentUserId={currentUserId}
              now={now}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  instructorId,
  currentUserId,
  now,
}: {
  comment: CommentWithAuthor;
  instructorId: number;
  currentUserId: number | null;
  now: Date;
}) {
  const fetcher = useFetcher<{ success: boolean; error?: string }>();
  const [editing, setEditing] = useState(false);
  const isSaving =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === "edit-comment";

  // Close the editor on a successful save; toast on validation error.
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        setEditing(false);
      } else if (fetcher.data.error) {
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.state, fetcher.data]);

  const canEdit = canEditComment(comment, currentUserId);

  return (
    <li className="flex gap-3">
      <UserAvatar
        name={comment.authorName}
        avatarUrl={comment.authorAvatarUrl}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-medium">{comment.authorName}</span>
          {comment.userId === instructorId && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Instructor
            </span>
          )}
          <span
            className="text-xs text-muted-foreground"
            title={new Date(comment.createdAt).toLocaleString()}
          >
            {formatRelativeTime(comment.createdAt, now)}
          </span>
          {isEdited(comment.createdAt, comment.updatedAt) && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>

        {editing ? (
          <fetcher.Form method="post" action="/api/comments">
            <input type="hidden" name="intent" value="edit-comment" />
            <input type="hidden" name="commentId" value={comment.id} />
            <Textarea
              name="content"
              defaultValue={comment.content}
              rows={3}
              maxLength={MAX_COMMENT_LENGTH}
              required
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </fetcher.Form>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm text-foreground/90">
              {comment.content}
            </p>
            {canEdit && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Edit
              </button>
            )}
          </>
        )}
      </div>
    </li>
  );
}
