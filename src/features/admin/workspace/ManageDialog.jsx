import { QUESTION_POST_TYPE_ID } from "../../../../../src/config/postTypes.js";
import { useWorkspaceTranslation } from "@/locales/workspace/useWorkspaceTranslation";
import { useEffect, useRef, useState } from "react";
import { useAdminManageMutation, useAdminResourceQuery } from "./liveApi";
export default function ManageDialog({
  resource,
  action,
  record = {},
  onClose,
}) {
  const { w } = useWorkspaceTranslation();
  const categories = useAdminResourceQuery("categories", { skip: resource !== "lost-found" });
  const locations = useAdminResourceQuery("locations", { skip: resource !== "lost-found" });
  const ref = useRef(null);
  const [save, state] = useAdminManageMutation();
  const [validation, setValidation] = useState("");
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  async function submit(event) {
    event.preventDefault();
    if (state.isLoading) return;
    setValidation("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    let body;
    if (resource === "locations") body = { building: fields.building?.trim(), floor: fields.floor?.trim(), room: fields.room?.trim() };
    if (resource === "password") {
      body = fields;
      if (fields.newPassword !== fields.confirmedNewPassword) { setValidation("Passwords do not match."); return; }
    }
    if (resource === "lost-found") body = { ...fields, title: fields.title.trim(), categoryId: fields.categoryId ? Number(fields.categoryId) : null, locationId: fields.locationId ? Number(fields.locationId) : null };
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
        postTypeId: Number(fields.postTypeId ?? record.postTypeId ?? QUESTION_POST_TYPE_ID),
        parentId: record.parentId ?? null,
        codeSnippet: record.codeSnippet ?? null,
        codeLanguage: record.codeLanguage ?? null,
        imageUrls: record.imageUrls ?? [],
        tagIds: record.tagResponses?.map((tag) => tag.id) ?? [],
      };
    if (
      action !== "delete" &&
      ((resource === "locations" && !body.building) ||
        (resource === "lost-found" && !body.title) ||
        (resource === "categories" && !body.name) ||
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
                    resource === "locations" ? "location" : resource === "lost-found" ? "report" : resource === "categories"
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
            {resource === "password" && <>{[["oldPassword", "Current password"], ["newPassword", "New password"], ["confirmedNewPassword", "Confirm new password"]].map(([name, label]) => <label key={name}>{w(label)}<input type="password" name={name} required minLength={name === "oldPassword" ? undefined : 8} maxLength={name === "oldPassword" ? undefined : 100} autoComplete={name === "oldPassword" ? "current-password" : "new-password"} /></label>)}</>}
            {resource === "locations" && <>{["building", "floor", "room"].map(name => <label key={name}>{w(name)}<input name={name} defaultValue={record[name] || ""} required={name === "building" || (name === "floor" && Boolean(record.building) && record.floor == null) || (name === "room" && record.floor != null)} /></label>)}</>}
            {resource === "lost-found" && <>
              <label>{w("Title")}<input name="title" required maxLength={300} /></label>
              <label>{w("Description")}<textarea name="description" rows={4} /></label>
              <label>{w("Type")}<select name="itemType"><option value="lost">{w("Lost")}</option><option value="found">{w("Found")}</option></select></label>
              <label>{w("Date")}<input type="date" name="itemDate" required /></label>
              <label>{w("Scope")}<select name="scope"><option value="istad">ISTAD</option><option value="public">{w("Public")}</option></select></label>
              <label>{w("Category")}<select name="categoryId" disabled={categories.isFetching || categories.isError}><option value="">—</option>{categories.data?.rows.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
              <label>{w("Location")}<select name="locationId" disabled={locations.isFetching || locations.isError}><option value="">—</option>{locations.data?.rows.map(row => <option key={row.id} value={row.id}>{[row.building, row.floor, row.room].filter(Boolean).join(", ")}</option>)}</select></label>
              {[categories, locations].map((query, index) => query.isError && <p role="alert" key={index}>{w("Could not load options.")} <button type="button" className="al-button" onClick={query.refetch}>{w("Retry")}</button></p>)}
              <label>{w("Location details")}<input name="freeTextLocation" /></label>
              <label>{w("Private identifying detail")}<textarea name="hiddenDetail" rows={2} /></label>
              <label>{w("Photo URL")}<input name="photoUrl" type="url" pattern="https?://.+" /></label>
            </>}
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
                  <input type="hidden" name="postTypeId" value={QUESTION_POST_TYPE_ID} />
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
                : Number(state.error?.originalStatus ?? state.error?.status) >= 500
                  ? w("The server could not complete this action (HTTP {{status}}). Contact the administrator to check the server logs.", { status: state.error?.originalStatus ?? state.error?.status })
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
            className={`al-button${action === "delete" ? " al-confirm-delete-button" : ""}`}
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
