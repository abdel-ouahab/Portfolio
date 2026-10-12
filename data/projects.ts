import type { Project } from "@/types";

/**
 * Project content. Links stay undefined until a public repository or
 * deployment exists; the UI shows an explicit note instead of a dead link.
 */
export const projects: Project[] = [
  {
    slug: "sales-inventory-platform",
    title: "Sales & Inventory Management Platform",
    shortTitle: "Sales & Inventory",
    kind: "Business platform",
    summary:
      "Products, stock, customers, and orders in one system, with an admin dashboard and a point-of-sale module.",
    description:
      "A management platform for retail operations. It covers the full flow from stocking products to selling them at the counter, with an administrative dashboard for managers and a point-of-sale module for staff. Access to each part of the system is governed by roles.",
    highlights: [
      "Product, inventory, customer, and order management",
      "Administrative dashboard",
      "Point-of-sale module",
      "Authentication and role-based access control",
    ],
    stack: ["Next.js", "TypeScript", "GraphQL", "PostgreSQL", "Prisma"],
    entities: ["Product", "Inventory", "Order", "Customer", "Sale", "Role"],
    featured: true,
    links: {},
  },
  {
    slug: "ma-vue-optic",
    title: "Ma Vue Optic",
    shortTitle: "Ma Vue Optic",
    kind: "E-commerce platform",
    summary:
      "An online eyewear store with separate customer and administration interfaces.",
    description:
      "An e-commerce platform for an eyewear retailer. Customers browse the catalog and place orders; administrators manage products, stock, orders, and customer records from a dedicated interface.",
    highlights: [
      "Customer storefront and administration interface",
      "Product catalog and inventory management",
      "Order and customer management",
    ],
    stack: ["React", "Node.js", "Express.js", "PostgreSQL"],
    entities: ["Product", "Category", "Order", "Customer", "Stock"],
    featured: true,
    links: {},
  },
  {
    slug: "veterinary-clinic-platform",
    title: "Veterinary Clinic Management Platform",
    shortTitle: "Veterinary Clinic",
    kind: "Clinic management",
    summary: "Animals, owners, consultations, and appointments for a veterinary practice.",
    description:
      "A management platform for veterinary clinics. It keeps records of animals and their owners, tracks consultations, and schedules appointments.",
    highlights: [
      "Animal and owner records",
      "Consultation history",
      "Appointment scheduling",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
    entities: ["Owner", "Animal", "Consultation", "Appointment"],
    featured: true,
    links: {},
  },
  {
    slug: "cloud-resource-optimization",
    title: "Cloud Resource Optimization",
    shortTitle: "Cloud Optimization",
    kind: "Master's thesis research",
    summary:
      "Virtual machine migration and resource allocation, balancing energy efficiency against quality of service.",
    description:
      "My Master's thesis project. It studies how virtual machines are placed and migrated across physical hosts in a cloud data center, and how allocation decisions trade energy efficiency against quality of service.",
    highlights: [
      "Virtual machine migration",
      "Resource allocation",
      "Energy efficiency",
      "Quality of service in cloud computing",
    ],
    stack: ["Cloud computing", "Virtualization"],
    entities: ["Host", "VirtualMachine", "Migration", "Allocation", "QoS"],
    featured: true,
    links: {},
  },
  {
    slug: "online-learning-platform",
    title: "Online Learning Platform",
    shortTitle: "Online Learning",
    kind: "E-learning platform",
    summary: "Courses, users, training programs, and educational content in one place.",
    description:
      "A learning platform for managing courses, users, training programs, and educational content.",
    highlights: [
      "Course and training program management",
      "User management",
      "Educational content management",
    ],
    stack: ["Laravel", "PHP", "MySQL", "JavaScript"],
    entities: ["User", "Course", "Program", "Lesson", "Enrollment"],
    featured: true,
    links: {},
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const featuredProjects = projects.filter((project) => project.featured);
