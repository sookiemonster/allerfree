// src/types/ResultsMessages.ts
import type { RestaurantInfo } from "./AnalysisJob";
import type { ApiProfile } from "../helpers/profileFormat";

/**
 * Messages the popup receives from the service worker (push + request results).
 */
export type MenuImagesPushMsg = {
  type: "MENU_IMAGES_PUSH";
  images: string[];
};

export type MenuImagesResultMsg = {
  type: "MENU_IMAGES_RESULT";
  images: string[];
};

export type RestaurantInfoPushMsg = {
  type: "RESTAURANT_INFO_PUSH";
  restaurant: RestaurantInfo | null;
};

export type RestaurantInfoResultMsg = {
  type: "RESTAURANT_INFO_RESULT";
  restaurant: RestaurantInfo | null;
};

export type ResultsPortInboundMessage =
  | MenuImagesPushMsg
  | MenuImagesResultMsg
  | RestaurantInfoPushMsg
  | RestaurantInfoResultMsg;

/**
 * Messages the popup sends to the service worker over the "popup" port.
 */
export type GetMenuImagesRequest = {
  type: "GET_MENU_IMAGES";
  tabId?: number;
};

export type GetRestaurantInfoRequest = {
  type: "GET_RESTAURANT_INFO";
  tabId?: number;
};

export type StartAnalysisRequest = {
  type: "START_ANALYSIS";
  profiles: ApiProfile[];
};

export type ResultsPortOutboundMessage =
  | GetMenuImagesRequest
  | GetRestaurantInfoRequest
  | StartAnalysisRequest;
