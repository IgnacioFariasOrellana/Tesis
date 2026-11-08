"use client";

import { DragEvent, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];

export function ProductPhotoDropzone({
  required = false,
  onError,
}: {
  required?: boolean;
  onError: (message: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);

  function selectFile(file: File | undefined) {
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) {
      if (input.current) input.current.value = "";
      setFileName("");
      onError("Selecciona una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      if (input.current) input.current.value = "";
      setFileName("");
      onError("La foto debe pesar 5 MB o menos.");
      return;
    }
    const transfer = new DataTransfer();
    transfer.items.add(file);
    if (input.current) input.current.files = transfer.files;
    setFileName(file.name);
    onError("");
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  return (
    <div
      className={`product-photo-dropzone ${dragging ? "is-dragging" : ""}`}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        if (event.target !== input.current) input.current?.click();
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={drop}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") input.current?.click();
      }}
    >
      <input
        ref={input}
        className="product-photo-input"
        name="photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />
      <UploadCloud size={30} />
      <div>
        <strong>
          {required ? "Fotografía del producto" : "Cambiar fotografía"}{" "}
          {required && <b className="required-mark">*</b>}
        </strong>
        <span>
          {fileName ||
            (required
              ? "Haz clic o arrastra una imagen aquí."
              : "Haz clic o arrastra una imagen para reemplazar la actual.")}
        </span>
        <small>JPG, PNG o WebP · máximo 5 MB</small>
      </div>
    </div>
  );
}
