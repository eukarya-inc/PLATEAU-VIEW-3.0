export const fetchWithGet = async <V>(url: string, token?: string): Promise<V> => {
  return await window
    .fetch(url, {
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    })
    .then(toJSON);
};

export const fetchWithPost = async <D>(
  url: string,
  data: D,
  token?: string,
  contentType?: string,
): Promise<D> => {
  return await window
    .fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    })
    .then(toJSON);
};

export const fetchWithPatch = async <D>(url: string, data: D, token?: string): Promise<D> => {
  return await window
    .fetch(url, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    })
    .then(toJSON);
};

export const fetchWithDelete = async (url: string, token?: string): Promise<boolean> => {
  return await window
    .fetch(url, {
      method: "DELETE",
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    })
    .then(checkStatusCode);
};

const toJSON = (response: Response) => {
  return response.json();
};

const checkStatusCode = (response: Response) => {
  return response.ok;
};

// export const fetchFileSize = async (url: string): Promise<number | null> => {
//   return await window
//     .fetch(url, {
//       method: "GET",
//       headers: { Range: "bytes=0-0" },
//     })
//     .then(response => {
//       const contentRange = response.headers.get("Content-Range");
//       if (contentRange) {
//         const totalSize = contentRange.split("/")[1];
//         return parseInt(totalSize, 10);
//       }
//       return null;
//     });
// };
