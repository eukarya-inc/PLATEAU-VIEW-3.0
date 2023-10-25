export const fetchWithGet = async <V>(url: string): Promise<V> => {
  return await window
    .fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(toJSON);
};

export const fetchWithPost = async <D>(url: string, data: D): Promise<boolean> => {
  return await window
    .fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(checkStatusCode);
};

export const fetchWithPatch = async <D>(url: string, data: D): Promise<boolean> => {
  return await window
    .fetch(url, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(checkStatusCode);
};

export const fetchWithDelete = async (url: string): Promise<boolean> => {
  return await window
    .fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
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
