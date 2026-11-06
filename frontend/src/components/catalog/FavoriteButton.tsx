"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

export function FavoriteButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button
      type="button"
      className={`heart-button ${liked ? "liked" : ""}`}
      onClick={() => setLiked((current) => !current)}
      aria-label={liked ? "Quitar favorito" : "Marcar favorito"}
    >
      <Heart size={18} fill={liked ? "currentColor" : "none"} />
    </button>
  );
}
