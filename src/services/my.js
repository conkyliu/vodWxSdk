import {requestJson} from "./request";

export function login(values) {
  return requestJson('/api/wx/login', {
    method: 'POST',
    body: values,
    hostType: 'console'
  });
}


export function binding() {
  return requestJson('/api/wx/binding', {
    method: 'POST',
    body: {"tenantId":"2202","studentIds":[2652],"phone":"15820302525"},
    hostType: 'console'
  });
}
