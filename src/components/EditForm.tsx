import { useState, useEffect, useRef, Fragment } from "react";
import { Listbox } from "@headlessui/react";
import Button from "../components/ui/Button";
import ErrorMsg from "../components/ErrorMsg/ErrorMsg";
import { Input } from "./ui/input";
import { Upload } from "lucide-react";

type EditFormField = {
  label: string;
  name: string;
  type: string;
  options?: string[] | { value: string | number; label: string }[];
  required?: boolean;
  defaultValue?: string | number | null;
};

type EditFormProps<T> = {
  data?: T | null;
  onSave: (formData: Partial<T>) => Promise<void>;
  closeModal: () => void;
  onFileChange?: (file: File, fieldName: string) => void;
  fields: EditFormField[];
  initializeData: T;
  loading?: boolean;
  submitLabel?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EditForm = <T extends Record<string, any>>({
  data,
  onSave,
  onFileChange,
  fields,
  closeModal,
  initializeData,
  loading = false,
  submitLabel = "Submit",
}: EditFormProps<T>) => {
  const [formData, setFormData] = useState<Partial<T>>(initializeData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      setFormData(initializeData);
    }
  }, [data, initializeData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (
      type === "file" &&
      e.target instanceof HTMLInputElement &&
      e.target.files
    ) {
      const file = e.target.files[0];
      if (onFileChange) {
        onFileChange(file, name);
      }
      setFormData({ ...formData, [name]: file });
      setFileNames({ ...fileNames, [name]: file.name });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (err) {
      console.error("Error saving form data:", err);
    }
  };

  const handleFileInputClick = (name: string) => {
    if (inputRefs.current[name]) {
      inputRefs.current[name]?.click();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {Array.isArray(fields) &&
        fields.map((field) => {
          if (field.type === "hidden") {
            return (
              <input
                key={field.name}
                type="hidden"
                name={field.name}
                value={
                  field.defaultValue || formData[field.name as keyof T] || ""
                }
              />
            );
          }

          return (
            <div key={field.name} className="space-y-2">
              <label
                htmlFor={field.name}
                className="block text-sm my-2 font-medium text-gray-700"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "select" ? (
                <Listbox
                  value={formData[field.name as keyof T]}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.name]: value,
                    }))
                  }
                  disabled={loading}
                >
                  <div className="relative">
                    <Listbox.Button
                      className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={loading}
                    >
                      {typeof formData[field.name as keyof T] === "string"
                        ? (formData[field.name as keyof T] as string)
                        : `Select ${field.label}`}
                    </Listbox.Button>

                    <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {(field.options || []).map((option) => {
                        const optionLabel =
                          typeof option === "string" ? option : option.label;
                        const optionValue =
                          typeof option === "string" ? option : option.value;
                        return (
                          <Listbox.Option
                            key={optionValue}
                            value={optionValue}
                            as={Fragment}
                          >
                            {({ active, selected }) => (
                              <li
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9
                              ${
                                active
                                  ? "text-white bg-indigo-600"
                                  : "text-gray-900"
                              }
                              ${selected ? "font-semibold" : "font-normal"}
                            `}
                              >
                                {optionLabel}
                              </li>
                            )}
                          </Listbox.Option>
                        );
                      })}
                    </Listbox.Options>
                  </div>
                </Listbox>
              ) : field.type === "file" ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <input
                      type="file"
                      name={field.name}
                      id={field.name}
                      ref={(el) => (inputRefs.current[field.name] = el)}
                      onChange={handleChange}
                      className="hidden"
                      disabled={loading}
                      accept={
                        field.name === "profile_image"
                          ? "image/jpeg,image/png"
                          : "video/mp4"
                      }
                    />
                    <div
                      className="flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => handleFileInputClick(field.name)}
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          {fileNames[field.name] || "Click to upload"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {field.name === "profile_image"
                          ? "PNG, JPG up to 10MB"
                          : "MP4 up to 10MB"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Input
                  type={field.type}
                  name={field.name}
                  id={field.name}
                  value={formData[field.name as keyof T] || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={loading}
                />
              )}

              {errors[field.name] && <ErrorMsg msg={errors[field.name]} />}
            </div>
          );
        })}

      <div className="flex justify-center mt-3 items-center space-x-4">
        <Button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-bold px-4 py-2 rounded-md flex items-center justify-center ${
            loading
              ? "bg-indigo-500 cursor-not-allowed"
              : "bg-indigo-700 hover:bg-indigo-800"
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            submitLabel || "Submit" 
          )}
        </Button>

        <Button
          type="button"
          onClick={closeModal}
          disabled={loading}
          className="bg-gray-400 w-full text-white font-bold px-4 py-2 rounded-md"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditForm;
