export type Category = {
  slug: string;
  title: string;
};

export type Announcement = {
  id: string;
  category?: Category;
  publisher: string;
  title: string;
  excerpt: string;
  body: string;
  created_at: string;
  active: boolean;
};

export type AnnouncementsList = {
  count: number;
  results: Announcement[];
};

export type AnnouncementsFilters = {
  max?: number;
  offset?: number;
  category?: string;
  page?: number;
  active?: boolean;
};

export type AnnouncementSignal = {
  data: Announcement;
};
