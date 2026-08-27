import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const userRoles = sqliteTable("user_roles", {
  id: integer("id").primaryKey({ autoIncrement: true }), email: text("email").notNull().unique(), role: text("role").notNull().default("member"), displayName: text("display_name"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }), kind: text("kind").notNull(), payload: text("payload").notNull(), status: text("status").notNull().default("novo"), ownerEmail: text("owner_email"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const contentItems = sqliteTable("content_items", {
  id: integer("id").primaryKey({ autoIncrement: true }), section: text("section").notNull(), key: text("key").notNull(), value: text("value").notNull().default(""), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [uniqueIndex("content_section_key_idx").on(table.section, table.key)]);
export const programs = sqliteTable("programs", {
  id: integer("id").primaryKey({ autoIncrement: true }), name: text("name").notNull(), day: text("day").notNull(), time: text("time").notNull(), location: text("location").notNull(), description: text("description").notNull().default(""), published: integer("published", { mode: "boolean" }).notNull().default(false),
});
export const cells = sqliteTable("cells", {
  id: integer("id").primaryKey({ autoIncrement: true }), name: text("name").notNull(), leader: text("leader").notNull(), neighborhood: text("neighborhood").notNull(), city: text("city").notNull(), day: text("day").notNull(), time: text("time").notNull(), ageRange: text("age_range"), audience: text("audience"), published: integer("published", { mode: "boolean" }).notNull().default(false),
});
export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }), slug: text("slug").notNull().unique(), name: text("name").notNull(), description: text("description").notNull().default(""), teacher: text("teacher"), workload: text("workload"), audience: text("audience"), startDate: text("start_date"), modality: text("modality"), enrollmentStatus: text("enrollment_status").notNull().default("closed"), certificateEnabled: integer("certificate_enabled", { mode: "boolean" }).notNull().default(false), published: integer("published", { mode: "boolean" }).notNull().default(false),
});
export const courseModules = sqliteTable("course_modules", {
  id: integer("id").primaryKey({ autoIncrement: true }), courseId: integer("course_id").notNull().references(() => courses.id), title: text("title").notNull(), position: integer("position").notNull().default(0),
});
export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }), moduleId: integer("module_id").notNull().references(() => courseModules.id), title: text("title").notNull(), content: text("content").notNull().default(""), videoUrl: text("video_url"), materialUrl: text("material_url"), position: integer("position").notNull().default(0),
});
export const courseProgress = sqliteTable("course_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }), email: text("email").notNull(), courseId: integer("course_id").notNull().references(() => courses.id), lessonId: integer("lesson_id").notNull().references(() => lessons.id), completedAt: text("completed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [uniqueIndex("progress_user_lesson_idx").on(table.email, table.lessonId)]);
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }), name: text("name").notNull(), description: text("description").notNull().default(""), eventDate: text("event_date").notNull(), time: text("time").notNull(), location: text("location").notNull(), capacity: integer("capacity"), registrationStatus: text("registration_status").notNull().default("closed"), published: integer("published", { mode: "boolean" }).notNull().default(false),
});
export const ministries = sqliteTable("ministries", {
  id: integer("id").primaryKey({ autoIncrement: true }), name: text("name").notNull(), description: text("description").notNull().default(""), leader: text("leader"), schedule: text("schedule"), imageUrl: text("image_url"), published: integer("published", { mode: "boolean" }).notNull().default(false),
});
export const galleries = sqliteTable("galleries", {
  id: integer("id").primaryKey({ autoIncrement: true }), name: text("name").notNull(), category: text("category").notNull(), published: integer("published", { mode: "boolean" }).notNull().default(false),
});
export const galleryPhotos = sqliteTable("gallery_photos", {
  id: integer("id").primaryKey({ autoIncrement: true }), galleryId: integer("gallery_id").notNull().references(() => galleries.id), imageUrl: text("image_url").notNull(), altText: text("alt_text").notNull().default(""), position: integer("position").notNull().default(0),
});
