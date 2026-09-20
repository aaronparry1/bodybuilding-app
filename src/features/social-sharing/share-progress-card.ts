import * as Sharing from "expo-sharing";
import type { RefObject } from "react";
import { Share, type View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { fallbackShareMessage, SHARE_CARD_EXPORT_HEIGHT, SHARE_CARD_EXPORT_WIDTH, type BrandedSharePayload } from "@/domain/training/share-cards";

export async function shareBrandedProgressCard(payload: BrandedSharePayload): Promise<boolean> {
  return shareTextFallback(payload);
}

export async function shareBrandedProgressLink(payload: BrandedSharePayload): Promise<boolean> {
  return shareTextFallback(payload);
}

export async function shareCapturedBrandedProgressCard(payload: BrandedSharePayload, cardRef: RefObject<View | null>): Promise<boolean> {
  try {
    if (!cardRef.current) return shareTextFallback(payload);
    const available = await Sharing.isAvailableAsync();
    if (!available) return shareTextFallback(payload);
    const uri = await captureRef(cardRef.current, {
      format: "png",
      quality: 1,
      result: "tmpfile",
      width: SHARE_CARD_EXPORT_WIDTH,
      height: SHARE_CARD_EXPORT_HEIGHT,
    });
    await Sharing.shareAsync(uri, {
      dialogTitle: payload.title,
      mimeType: "image/png",
      UTI: "public.png",
    });
    return true;
  } catch {
    return shareTextFallback(payload);
  }
}

async function shareTextFallback(payload: BrandedSharePayload): Promise<boolean> {
  try {
    const result = await Share.share({
      title: payload.title,
      message: payload.message,
    });
    return result.action !== Share.dismissedAction;
  } catch {
    await Share.share({
      title: payload.title,
      message: fallbackShareMessage(payload),
    });
    return true;
  }
}
