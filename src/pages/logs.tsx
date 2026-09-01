import { Elysia } from "elysia";
import { BaseHtml } from "../components/base";
import { Header } from "../components/header";
import db from "../db/db";
import { Filename } from "../db/types";
import { ALLOW_UNAUTHENTICATED, WEBROOT } from "../helpers/env";
import { userService } from "./user";

export const logs = new Elysia().use(userService).get(
  "/results/:jobId/logs/:fileId",
  ({ params, set, user }) => {
    const file = db
      .query(
        `SELECT file_names.* FROM file_names
         JOIN jobs ON jobs.id = file_names.job_id
         WHERE file_names.id = ? AND file_names.job_id = ? AND jobs.user_id = ?`,
      )
      .as(Filename)
      .get(params.fileId, params.jobId, user.id);

    if (!file?.log) {
      set.status = 404;
      return { message: "Conversion log not found." };
    }

    return (
      <BaseHtml webroot={WEBROOT} title="ConvertX | Conversion log">
        <>
          <Header webroot={WEBROOT} allowUnauthenticated={ALLOW_UNAUTHENTICATED} loggedIn />
          <main
            class={`
              w-full flex-1 px-2
              sm:px-4
            `}
          >
            <article class="article">
              <h1 class="mb-4 text-xl">Conversion log</h1>
              <p safe class="mb-4 text-neutral-400">
                {file.file_name}
              </p>
              <pre safe class="overflow-x-auto rounded-sm bg-neutral-950 p-4 whitespace-pre-wrap">
                {file.log}
              </pre>
            </article>
          </main>
        </>
      </BaseHtml>
    );
  },
  { auth: true },
);
