import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  budgetReceipt: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "8MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, name: file.name, size: file.size, type: file.type };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
