import {requestText} from "./request";

export function signature() {
  return requestText(`/api/vod/signature`, {
    method: 'GET',

  })
}
