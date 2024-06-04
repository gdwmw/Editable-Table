"use client";

import { FC, FormEvent, ReactElement, useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { FaLongArrowAltDown, FaLongArrowAltUp, FaPlus, FaSave, FaTrashAlt, FaUndo } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import loadingAnimation from "@/public/assets/animations/loadings/loading.svg";
import { DELETEEditableTable, GETEditableTable, IEditableTable, POSTEditableTable, PUTEditableTable } from "@/utils";

export const Main: FC = (): ReactElement => {
  const queryClient = useQueryClient();
  const { data: response } = useQuery({
    queryFn: GETEditableTable,
    queryKey: ["GETEditableTable"],
  });

  const [data, setData] = useState<IEditableTable[]>(response || []);
  const [dataKeeper, setDataKeeper] = useState<IEditableTable[]>(response || []);
  const [addData, setAddData] = useState<IEditableTable[]>([]);
  const [addEmailError, setAddEmailError] = useState<string[]>([]);
  const [addEmailValidation, setAddEmailValidation] = useState<boolean[]>([false, false]);
  const [updateEmailError, setUpdateEmailError] = useState<Record<string, string>>({});
  const [updateEmailValidation, setUpdateEmailValidation] = useState<boolean[]>([false, false]);
  const [sortColumn, setSortColumn] = useState<null | string>(null);
  const [sortAscending, setSortAscending] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAdd = useMutation({
    mutationFn: (data: IEditableTable[]) => POSTEditableTable(data),
    onError: () => {
      setLoading(false);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["GETEditableTable"] });
      setAddData([]);
    },
  });

  const handleUpdate = useMutation({
    mutationFn: (data: IEditableTable[]) => PUTEditableTable(data),
    onError: () => {
      setLoading(false);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["GETEditableTable"] });
    },
  });

  const handleDelete = useMutation({
    mutationFn: (id: string | undefined) => DELETEEditableTable(id ?? ""),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["GETEditableTable"] });
    },
  });

  useEffect(() => {
    setData(response || []);
    setDataKeeper(response || []);
    setLoading(false);
  }, [response]);

  const sortData = (data: IEditableTable[], column: null | string, ascending: boolean) => {
    if (!column) return data;
    const sortedData = data.toSorted((a: any, b: any) => {
      if (a[column] < b[column]) return ascending ? -1 : 1;
      if (a[column] > b[column]) return ascending ? 1 : -1;
      return 0;
    });
    return sortedData;
  };

  const changeSortColumn = (column: string) => {
    if (sortColumn === column) {
      setSortAscending(!sortAscending);
    } else {
      setSortColumn(column);
      setSortAscending(true);
    }
  };

  const handleSortArrow = (column: string) => {
    if (sortColumn === column) {
      return sortAscending ? <FaLongArrowAltUp /> : <FaLongArrowAltDown />;
    }
    return null;
  };

  const handleSetData = (e: React.ChangeEvent<HTMLInputElement>, id: string | undefined, column: string) => {
    if (id) {
      setData(data.map((d) => (d.id === id ? { ...d, [column]: e.target.value } : d)));
    }
  };

  const handleSetAddData = (e: React.ChangeEvent<HTMLInputElement>, index: number | undefined, column: string) => {
    if (index !== undefined) {
      setAddData(addData.map((item, i) => (i === index ? { ...item, [column]: e.target.value } : item)));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const hasAddData = addData.length > 0 && addEmailValidation.every((val) => val === false);
    const updatedData = data.filter((item, i) =>
      Object.keys(item).some((key) => item[key as keyof IEditableTable] !== dataKeeper[i][key as keyof IEditableTable]),
    );
    const hasUpdatedData = updatedData.length > 0 && updateEmailValidation.every((val) => val === false);
    if (hasAddData) {
      handleAdd.mutate(addData);
    }
    if (hasUpdatedData) {
      handleUpdate.mutate(updatedData);
    }
    if (!hasAddData && !hasUpdatedData) {
      const emailValidationFailed = addEmailValidation.some((val) => val === true) || updateEmailValidation.some((val) => val === true);
      if (emailValidationFailed) {
        alert("Please check your email input.");
      } else {
        alert("There is no data to update.");
      }
      setLoading(false);
    }
  };

  const validateAddEmail = (index: number, email: string, data: IEditableTable[]) => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    let emailValidation = [...addEmailValidation];
    let emailError = [...addEmailError];
    const updateErrorAndValidation = (isValid: boolean, errorMessage: string, validationIndex: number) => {
      if (emailValidation.length > 1) {
        emailValidation[validationIndex] = isValid;
      }
      emailError[index] = errorMessage;
      setAddEmailValidation(emailValidation);
      setAddEmailError(emailError);
    };
    if (!emailRegex.test(email)) {
      updateErrorAndValidation(true, "Email is not valid.", 0);
      return;
    }
    if (data.some((person) => person.email === email)) {
      updateErrorAndValidation(true, "Email is already in use.", 1);
      return;
    }
    setAddEmailValidation([false, false]);
    setAddEmailError((prev) => prev.filter((_, i) => i !== index));
  };

  const validateUpdateEmail = (id: string | undefined, email: string, data: IEditableTable[]) => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    let emailValidation = [...updateEmailValidation];
    const updateErrorAndValidation = (isValid: boolean, errorMessage: string, index: number) => {
      if (emailValidation.length > 1) {
        emailValidation[index] = isValid;
      }
      setUpdateEmailValidation(emailValidation);
      setUpdateEmailError((prev) => {
        return { ...prev, [String(id)]: errorMessage };
      });
    };
    if (!emailRegex.test(email)) {
      updateErrorAndValidation(true, "Email is not valid.", 0);
      return;
    }
    if (data.some((person) => person.email === email && person.id !== id)) {
      updateErrorAndValidation(true, "Email is already in use.", 1);
      return;
    }
    setUpdateEmailValidation([false, false]);
    setUpdateEmailError((prev) => {
      const { [String(id)]: _, ...rest } = prev;
      return rest;
    });
  };

  const sortedData = sortData(data || [], sortColumn, sortAscending);
  const sortedDataKeeper = sortData(dataKeeper || [], sortColumn, sortAscending);

  const perPage = 30;
  const indexOfLastData = currentPage * perPage;
  const indexOfFirstData = indexOfLastData - perPage;
  const currentData = sortedData?.slice(indexOfFirstData, indexOfLastData);
  const currentDataKeeper = sortedDataKeeper?.slice(indexOfFirstData, indexOfLastData);
  const totalPage = sortedData && Math.ceil(sortedData.length / perPage);

  useEffect(() => {
    if (data?.length !== 0) {
      setCurrentPage(1);
    }
  }, [data]);

  return (
    <>
      {loading && (
        <section className="fixed left-0 top-0 z-20 flex size-full items-center justify-center bg-black/30 backdrop-blur-sm">
          <Image alt="Loading..." src={loadingAnimation} width={100} />
        </section>
      )}

      <main className="p-5">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <section className="flex items-center justify-between gap-5">
            <h1 className="text-xl font-semibold">Editable Table: Gede Dewo Wahyu Mustika Wiwaha</h1>
            <div className="ml-auto flex gap-5 px-5">
              <button
                className="active:scale-90"
                onClick={() => {
                  setAddData([...addData, { email: "", first_name: "", last_name: "", phone_number: "", position: "" }]);
                }}
                type="button"
              >
                <FaPlus size={20} />
              </button>

              <button className="active:scale-90" type="submit">
                <FaSave size={20} />
              </button>

              <button className="active:scale-90" onClick={() => setData(response || [])} type="button">
                <FaUndo size={18} />
              </button>
            </div>
          </section>
          <section className="max-h-[82vh] overflow-auto border-2">
            <table className="w-full border-separate">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="divide-x-2">
                  <th className="cursor-pointer border-b-2 p-3 hover:bg-gray-300" onClick={() => changeSortColumn("first_name")}>
                    <div className="flex items-center justify-center whitespace-nowrap">First Name {handleSortArrow("first_name")}</div>
                  </th>
                  <th className="cursor-pointer border-b-2 p-3 hover:bg-gray-300" onClick={() => changeSortColumn("last_name")}>
                    <div className="flex items-center justify-center whitespace-nowrap">Last Name {handleSortArrow("last_name")}</div>
                  </th>
                  <th className="cursor-pointer border-b-2 p-3 hover:bg-gray-300" onClick={() => changeSortColumn("position")}>
                    <div className="flex items-center justify-center whitespace-nowrap">Position {handleSortArrow("position")}</div>
                  </th>
                  <th className="cursor-pointer border-b-2 p-3 hover:bg-gray-300" onClick={() => changeSortColumn("phone_number")}>
                    <div className="flex items-center justify-center whitespace-nowrap">Phone Number {handleSortArrow("phone_number")}</div>
                  </th>
                  <th className="cursor-pointer border-b-2 p-3 hover:bg-gray-300" onClick={() => changeSortColumn("email")}>
                    <div className="flex items-center justify-center whitespace-nowrap">Email {handleSortArrow("email")}</div>
                  </th>
                  <th className="border-b-2 p-3">Delete</th>
                </tr>
              </thead>
              <tbody>
                {addData.map((add, index) => (
                  <tr className="divide-x-2" key={index}>
                    <td className="border-b-2 focus-within:border-blue-300">
                      <input
                        className={`h-full min-w-full px-3 py-2 outline-none ${add.first_name === "" ? "" : "bg-green-300 focus:bg-transparent"}`}
                        id={`${add.first_name}-${index}`}
                        onChange={(e) => handleSetAddData(e, index, "first_name")}
                        required
                        type="text"
                        value={add.first_name}
                      />
                    </td>
                    <td className="border-b-2 focus-within:border-blue-300">
                      <input
                        className={`h-full min-w-full px-3 py-2 outline-none ${add.last_name === "" ? "" : "bg-green-300 focus:bg-transparent"}`}
                        id={`${add.last_name}-${index}`}
                        onChange={(e) => handleSetAddData(e, index, "last_name")}
                        required
                        type="text"
                        value={add.last_name}
                      />
                    </td>
                    <td className="border-b-2 focus-within:border-blue-300">
                      <input
                        className={`h-full min-w-full px-3 py-2 outline-none ${add.position === "" ? "" : "bg-green-300 focus:bg-transparent"}`}
                        id={`${add.position}-${index}`}
                        onChange={(e) => handleSetAddData(e, index, "position")}
                        required
                        type="text"
                        value={add.position}
                      />
                    </td>
                    <td className="border-b-2 focus-within:border-blue-300">
                      <input
                        className={`h-full min-w-full px-3 py-2 outline-none ${add.phone_number === "" ? "" : "bg-green-300 focus:bg-transparent"}`}
                        id={`${add.phone_number}-${index}`}
                        onChange={(e) => handleSetAddData(e, index, "phone_number")}
                        required
                        type="text"
                        value={add.phone_number}
                      />
                    </td>
                    <td className="relative border-b-2 focus-within:border-blue-300">
                      <input
                        className={`h-full min-w-full px-3 py-2 outline-none ${add.email === "" ? "" : "bg-green-300 focus:bg-transparent"}`}
                        id={`${add.email}-${index}`}
                        onChange={(e) => {
                          validateAddEmail(index, e.target.value, dataKeeper);
                          handleSetAddData(e, index, "email");
                        }}
                        required
                        type="text"
                        value={add.email}
                      />
                      {addEmailError[index] && <span className="absolute right-0 top-0 text-xs text-red-500">{addEmailError[index]}</span>}
                    </td>
                  </tr>
                ))}
                {currentData?.map((person, index) => (
                  <tr className="divide-x-2" key={person.id}>
                    <td className="border-b-2 focus-within:border-blue-300">
                      <input
                        className={`h-full min-w-full px-3 py-2 outline-none ${person.first_name === currentDataKeeper?.[index].first_name ? "" : "bg-green-300 focus:bg-transparent"}`}
                        id={`${person.first_name}-${person.id}`}
                        onChange={(e) => handleSetData(e, person.id, "first_name")}
                        required
                        type="text"
                        value={person.first_name}
                      />
                    </td>
                    <td className="border-b-2 focus-within:border-blue-300">
                      <input
                        className={`h-full min-w-full px-3 py-2 outline-none ${person.last_name === currentDataKeeper?.[index].last_name ? "" : "bg-green-300 focus:bg-transparent"}`}
                        id={`${person.last_name}-${person.id}`}
                        onChange={(e) => handleSetData(e, person.id, "last_name")}
                        required
                        type="text"
                        value={person.last_name}
                      />
                    </td>
                    <td className="border-b-2 focus-within:border-blue-300">
                      <input
                        className={`h-full min-w-full px-3 py-2 outline-none ${person.position === currentDataKeeper?.[index].position ? "" : "bg-green-300 focus:bg-transparent"}`}
                        id={`${person.position}-${person.id}`}
                        onChange={(e) => handleSetData(e, person.id, "position")}
                        required
                        type="text"
                        value={person.position}
                      />
                    </td>
                    <td className="border-b-2 focus-within:border-blue-300">
                      <input
                        className={`h-full min-w-full px-3 py-2 outline-none ${person.phone_number === currentDataKeeper?.[index].phone_number ? "" : "bg-green-300 focus:bg-transparent"}`}
                        id={`${person.phone_number}-${person.id}`}
                        onChange={(e) => handleSetData(e, person.id, "phone_number")}
                        required
                        type="text"
                        value={person.phone_number}
                      />
                    </td>
                    <td className="relative border-b-2 focus-within:border-blue-300">
                      <input
                        className={`h-full min-w-full px-3 py-2 outline-none ${person.email === currentDataKeeper?.[index].email ? "" : "bg-green-300 focus:bg-transparent"}`}
                        id={`${person.email}-${person.id}`}
                        onChange={(e) => {
                          validateUpdateEmail(person.id, e.target.value, dataKeeper);
                          handleSetData(e, person.id, "email");
                        }}
                        required
                        type="text"
                        value={person.email}
                      />
                      {person.id && updateEmailError[person.id] && (
                        <span className="absolute right-0 top-0 text-xs text-red-500">{updateEmailError[person.id]}</span>
                      )}
                    </td>
                    <td className="flex items-center justify-center border-b-2 p-3">
                      <button className="active:scale-90" onClick={() => handleDelete.mutate(person.id)} type="button">
                        <FaTrashAlt size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-5 w-full border-t py-3">
            <div className="flex items-center justify-between">
              <section>
                <span className="text-sm font-semibold">{`Showing ${indexOfLastData > 0 ? indexOfFirstData + 1 : 0} - ${(sortedData && Math.min(indexOfLastData, sortedData.length)) ?? 0} of ${sortedData?.length ?? 0} result.`}</span>
              </section>

              <section>
                <ul className="flex items-center gap-3">
                  <li>
                    <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} type="button">
                      <IoIosArrowBack className="cursor-pointer active:scale-90" />
                    </button>
                  </li>

                  <li>
                    <span className="text-sm">{currentPage ?? 0}</span>
                  </li>
                  <li>
                    <span>/</span>
                  </li>
                  <li>
                    <span className="text-sm">{totalPage ?? 0}</span>
                  </li>

                  <li>
                    <button
                      onClick={() => {
                        if (totalPage !== undefined) {
                          setCurrentPage((prev) => Math.min(prev + 1, totalPage));
                        }
                      }}
                      type="button"
                    >
                      <IoIosArrowForward className="cursor-pointer active:scale-90" />
                    </button>
                  </li>
                </ul>
              </section>

              <section>
                <span className="text-sm font-semibold">{`Showing ${indexOfLastData > 0 ? indexOfFirstData + 1 : 0} - ${(sortedData && Math.min(indexOfLastData, sortedData.length)) ?? 0} of ${sortedData?.length ?? 0} result.`}</span>
              </section>
            </div>
          </section>
        </form>
      </main>
    </>
  );
};
