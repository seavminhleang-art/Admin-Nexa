import { useWorkspaceTranslation } from "@/locales/workspace/useWorkspaceTranslation";
import { useEffect, useRef, useState } from "react";
import { useAdminManageMutation } from "./liveApi";
export default function ManageDialog({
  resource,
  action,
  record = {},
  onClose,
}) {
  const { w } = useWorkspaceTranslation();
  const ref = useRef(null);
  const [save, state] = useAdminManageMutation();
  const [validation, setValidation] = useState("");
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  async function submit(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    let body;
    if (resource === "categories")
      body = {
        name: fields.name?.trim(),
      };
    if (resource === "tags")
      body = {
        tagName: fields.tagName?.trim(),
      };
    if (resource === "comments")
      body = {
        text: fields.text?.trim(),
        postId: Number(fields.postId ?? record.postId),
      };
    if (resource === "profile")
      body = {
        username: fields.username?.trim(),
        bio: fields.bio?.trim(),
      };
    if (resource === "posts")
      body = {
        title: fields.title?.trim(),
        body: fields.body?.trim(),
        postTypeId: Number(fields.postTypeId ?? record.postTypeId ?? 1),
        parentId: record.parentId ?? null,
        codeSnippet: record.codeSnippet ?? null,
        codeLanguage: record.codeLanguage ?? null,
        imageUrls: record.imageUrls ?? [],
        tagIds: record.tagResponses?.map((tag) => tag.id) ?? [],
      };
    if (
      action !== "delete" &&
      ((resource === "categories" && !body.name) ||
        (resource === "tags" && body.tagName.length < 2) ||
        (resource === "comments" && (!body.postId || body.text.length < 5)) ||
        (resource === "posts" &&
          (body.title.length < 10 || body.body.length < 20)))
    ) {
      setValidation(
        "Please fill in all fields with the required minimum length.",
      );
      return;
    }
    const result = await save({
      resource,
      action,
      id: record.id,
      body,
    });
    if (!result.error) onClose();
  }
  return (
    <dialog
      ref={ref}
      className="al-manage-dialog"
      onCancel={(event) => {
        if (state.isLoading) event.preventDefault();
        else onClose();
      }}
    >
      <form onSubmit={submit}>
        <h2>
          {action === "delete"
            ? w("Delete record")
            : action === "create"
              ? w("Create {{value0}}", {
                  value0: w(
                    resource === "categories"
                      ? "category"
                      : resource === "tags"
                        ? "tag"
                        : resource === "posts"
                          ? "post"
                          : "comment",
                  ),
                })
              : w("Edit details")}
        </h2>
        {action === "delete" ? (
          <p>
            {w("Delete \u201C")}
            {record.title ||
              record.displayName ||
              record.tagName ||
              record.text ||
              record.id}
            {w("\u201D? This cannot be undone.")}
          </p>
        ) : (
          <>
            {resource === "categories" && (
              <label>
                {w("Category name")}
                <input
                  name="name"
                  required
                  maxLength={100}
                  defaultValue={record.name}
                />
              </label>
            )}
            {resource === "tags" && (
              <label>
                {w("Tag name")}
                <input
                  name="tagName"
                  required
                  minLength={2}
                  maxLength={50}
                  defaultValue={record.tagName}
                />
              </label>
            )}
            {resource === "posts" && (
              <>
                <label>
                  {w("Title (at least 10 characters)")}
                  <input
                    name="title"
                    required
                    minLength={10}
                    maxLength={300}
                    defaultValue={record.title}
                  />
                </label>
                <label>
                  {w("Content (at least 20 characters)")}
                  <textarea
                    name="body"
                    required
                    minLength={20}
                    rows={7}
                    defaultValue={record.body}
                  />
                </label>
                {action === "create" && (
                  <input type="hidden" name="postTypeId" value="1" />
                )}
              </>
            )}
            {resource === "comments" && (
              <>
                <label>
                  {w("Post ID")}
                  <input
                    name="postId"
                    type="number"
                    min="1"
                    required
                    defaultValue={record.postId}
                    readOnly={action === "update"}
                  />
                </label>
                <label>
                  {w("Comment (5\u2013500 characters)")}
                  <textarea
                    name="text"
                    required
                    minLength={5}
                    maxLength={500}
                    rows={5}
                    defaultValue={record.text}
                  />
                </label>
              </>
            )}
            {resource === "profile" && (
              <>
                <label>
                  {w("Display name")}
                  <input
                    name="username"
                    required
                    defaultValue={record.displayName}
                  />
                </label>
                <label>
                  {w("Bio")}
                  <textarea name="bio" rows={4} defaultValue={record.bio} />
                </label>
              </>
            )}
          </>
        )}
        {(validation || state.isError) && (
          <p className="al-alert" role="alert">
            {w(validation) ||
              (state.error?.status === 401 || state.error?.status === 403
                ? w(
                    "The backend did not authorize this action for your account.",
                  )
                : w("The change could not be saved. Please try again."))}
          </p>
        )}
        <div className="al-actions">
          <button
            className="al-button"
            type="button"
            disabled={state.isLoading}
            onClick={onClose}
          >
            {w("Cancel")}
          </button>
          <button
            className="al-button"
            type="submit"
            disabled={state.isLoading}
          >
            {state.isLoading
              ? w("Saving\u2026")
              : action === "delete"
                ? w("Delete permanently")
                : w("Save")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
