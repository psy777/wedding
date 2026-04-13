import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const weddingSettings = pgTable("wedding_settings", {
  id: serial("id").primaryKey(),
  weddingDate: text("wedding_date").default("2027-01-01"),
  totalBudget: doublePrecision("total_budget").default(0),
  partner1Name: text("partner1_name").default(""),
  partner2Name: text("partner2_name").default(""),
  venueName: text("venue_name").default(""),
  venueAddress: text("venue_address").default(""),
  venueCity: text("venue_city").default(""),
  venueState: text("venue_state").default(""),
  venueZip: text("venue_zip").default(""),
  venueMapUrl: text("venue_map_url").default(""),
  ceremonyTime: text("ceremony_time").default(""),
  receptionTime: text("reception_time").default(""),
  rsvpDeadline: text("rsvp_deadline").default(""),
  guestCap: integer("guest_cap"),
  dressCode: text("dress_code").default(""),
  directions: text("directions").default(""),
  parking: text("parking").default(""),
  planPasscode: text("plan_passcode").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").default(""),
  phone: text("phone").default(""),
  notes: text("notes").default(""),
  bookingUrl: text("booking_url").default(""),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const checklistItems = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  monthsBefore: doublePrecision("months_before").notNull(),
  isCustom: boolean("is_custom").default(false),
  completed: boolean("completed").default(false),
  notes: text("notes").default(""),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  budgetAmount: doublePrecision("budget_amount").default(0),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => budgetCategories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  estimated: doublePrecision("estimated").default(0),
  actual: doublePrecision("actual").default(0),
  paid: boolean("paid").default(false),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const budgetAttachments = pgTable("budget_attachments", {
  id: serial("id").primaryKey(),
  budgetItemId: integer("budget_item_id")
    .notNull()
    .references(() => budgetItems.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  contentType: text("content_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passkeyCredentials = pgTable("passkey_credentials", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").notNull().default(0),
  transports: text("transports").default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const seatingTables = pgTable("seating_tables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull().default(8),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const seatingGuests = pgTable("seating_guests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tableId: integer("table_id").references(() => seatingTables.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});
