export const editUserFields = [
  {
    label: "Profile Image",
    name: "profile_image",
    type: "file",
    required: false,
  },

  { label: "Name", name: "name", type: "text", required: true },
  { label: "Email", name: "email", type: "email", required: true },
  { label: "Phone", name: "phone", type: "tel", required: false },
  {
    label: "Role",
    name: "role",
    type: "select",
    options: ["admin", "client", "owner"],
    required: true,
  },
];

export const AddUserFields = [
  {
    label: "Profile Image",
    name: "profile_image",
    type: "file",
    required: false,
  },
  { label: "Intro Video", name: "intro_video", type: "file", required: false },
  { label: "Name", name: "name", type: "text", required: true },
  { label: "Email", name: "email", type: "email", required: true },
  { label: "Phone", name: "phone", type: "tel", required: false },
  {
    label: "Role",
    name: "role",
    type: "select",
    options: ["owner", "client", "admin"],
    required: true,
  },
];

export const AddBookingFields = [
  { label: "Name", name: "name", type: "text", required: true },
  { label: "Email", name: "email", type: "email", required: true },
  { label: "Phone", name: "phone", type: "tel", required: false },
  {
    label: "Property Name",
    name: "property_name",
    type: "text",
    required: true,
  },

  {
    label: "End Date",
    name: "end_date",
    type: "date",
    required: true,
  },
  {
    label: "Status",
    name: "status",
    type: "select",
    options: ["pending", "confirmed", "cancelled"],

    required: true,
  },
];
export const PropertyFields = [
  { label: "Property Name", name: "name", type: "text", required: true },
  { label: "Location", name: "location", type: "text", required: true },
  { label: "Price", name: "price", type: "number", required: true },
  {
    label: "Images",
    name: "images",
    type: "file",
    required: false,
  },
];
export const AddPropertyFields = [
  { label: "Property Name", name: "name", type: "text", required: true },
  {
    label: "Property description",
    name: "description",
    type: "text",
    required: true,
  },
  { label: "Location", name: "location", type: "text", required: true },
  { label: "Price", name: "price", type: "number", required: true },
  {
    label: "Image",
    name: "profile_image",
    type: "file",
    required: false,
  },
];
