const URL = process.env.NEXT_PUBLIC_EDITABLE_TABLE;

if (!URL) {
  throw new Error("The URL is not defined. Please check your environment variables.");
}

export interface IEditableTable {
  email: string;
  first_name: string;
  id?: string;
  last_name: string;
  phone_number: string;
  position: string;
}

export const GETEditableTable = async (): Promise<IEditableTable[]> => {
  try {
    const res = await fetch(URL, {
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: Editable Table with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const POSTEditableTable = async (data: IEditableTable[]): Promise<IEditableTable[]> => {
  try {
    const results = await Promise.all(
      data.map(async (item) => {
        const res = await fetch(URL, {
          body: JSON.stringify(item),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });

        if (!res.ok) {
          throw new Error(`Failed to post: Editable Table with status ${res.status}`);
        }

        return await res.json();
      }),
    );

    return results;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const PUTEditableTable = async (data: IEditableTable[]): Promise<IEditableTable[]> => {
  try {
    const results = await Promise.all(
      data.map(async (item) => {
        const res = await fetch(`${URL}/${item.id}`, {
          body: JSON.stringify(item),
          headers: {
            "Content-Type": "application/json",
          },
          method: "PUT",
        });

        if (!res.ok) {
          throw new Error(`Failed to put: Editable Table with status ${res.status}`);
        }

        return await res.json();
      }),
    );

    return results;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const DELETEEditableTable = async (id: string): Promise<IEditableTable> => {
  try {
    const res = await fetch(`${URL}/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(`Failed to delete: Editable Table with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
