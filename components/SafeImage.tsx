"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { BRAND } from "@/lib/brand-config";

interface SafeImageProps extends ImageProps {
  fallbackSrc?: string;
}

export default function SafeImage({ src, alt, fallbackSrc = "/hero-fish.png", ...props }: SafeImageProps) {
  const [prevSrc, setPrevSrc] = useState<ImageProps["src"]>(src);
  const [imgSrc, setImgSrc] = useState<ImageProps["src"]>(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setImgSrc(src);
  }

  return (
    <Image
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt || `${BRAND.shopName} visual display`}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
}
