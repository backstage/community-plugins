/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

/** @public */
export const announcementsTranslationRef = createTranslationRef({
  id: 'announcements',
  messages: {
    announcementForm: {
      title: 'Title',
      excerpt: 'Excerpt',
      active: 'Active',
      submit: 'Submit',
      editAnnouncement: 'Edit announcement',
      newAnnouncement: 'New announcement',
      startAt: 'Announcement start date',
      untilDate: 'Announcement end date',
      onBehalfOf: 'On behalf of',
      categoryInput: {
        create: 'Create',
        label: 'Category',
      },
      tagsInput: {
        create: 'Create',
        label: 'Tags',
      },
      tagsLabel: 'Tags',
    },
    announcementsPage: {
      newAnnouncement: 'New announcement',
      genericNew: 'New',
      card: {
        by: 'By',
        in: 'in',
        edit: 'Edit',
        delete: 'Delete',
        occurred: 'Occurred ',
        scheduled: 'Scheduled ',
        today: 'Today',
      },
      grid: {
        announcementDeleted: 'Announcement deleted.',
      },
      contextMenu: {
        admin: 'Admin',
        categories: 'Categories',
        tags: 'Tags',
      },
    },
    deleteDialog: {
      title: 'Are you sure you want to delete this announcement?',
      cancel: 'Cancel',
      delete: 'Delete',
    },
    announcementsCard: {
      seeAll: 'See all',
      announcements: 'Announcements',
      new: 'New',
      in: 'in',
      noAnnouncements: 'No announcements yet, want to',
      addOne: 'add one',
      occurred: 'Occurred',
      scheduled: 'Scheduled',
      today: 'Today',
    },
    announcementSearchResultListItem: {
      published: 'Published',
      announcement: 'Announcement',
    },
    announcementsTimeline: {
      noAnnouncements: 'No announcements',
      error: 'Error',
    },
    categoriesForm: {
      newCategory: 'New category',
      editCategory: 'Edit category',
      titleLabel: 'Title',
      submit: 'Submit',
    },
    categoriesTable: {
      categoryDeleted: 'Category deleted.',
      slug: 'Slug',
      title: 'Title',
      actions: 'Actions',
      addTooltip: 'Add',
      noCategoriesFound: 'No categories found.',
    },
    categoriesPage: {
      title: 'Categories',
      subtitle: 'Manage announcement categories',
    },
    tagsForm: {
      newTag: 'New tag',
      editTag: 'Edit tag',
      titleLabel: 'Title',
      submit: 'Submit',
      errors: {
        alreadyExists: 'A tag with this name already exists.',
        invalidTitle: 'Title is required.',
        tooLong: 'Title exceeds maximum length.',
      },
    },
    newTagDialog: {
      createdMessage: 'Tag created.',
      newTag: 'New tag',
      title: 'Title',
      cancelButton: 'Cancel',
      createButton: 'Create',
    },

    tagsPage: {
      title: 'Tags',
      subtitle: 'Manage announcement tags',
    },

    tagsTable: {
      tagDeleted: 'Tag deleted.',
      slug: 'Slug',
      title: 'Title',
      actions: 'Actions',
      addTooltip: 'Add',
      noTagsFound: 'No tags found.',
    },
    createAnnouncementPage: {
      alertMessage: 'Announcement created.',
      alertMessageWithNewCategory: 'with new category',
    },
    editAnnouncementPage: {
      updatedMessage: 'Announcement updated.',
      updatedMessageWithNewCategory: 'with new category',
      notFoundMessage: 'Unable to find announcement',
      edit: 'Edit',
    },
    newAnnouncementBanner: {
      markAsSeen: 'Mark as seen',
    },
    newCategoryDialog: {
      createdMessage: 'Category created.',
      newCategory: 'New category',
      title: 'Title',
      cancelButton: 'Cancel',
      createButton: 'Create',
    },
    admin: {
      adminPortal: {
        announcementsLabels: 'Announcements',
        categoriesLabel: 'Categories',
        tagsLabel: 'Tags',
        title: 'Admin Portal for Announcements',
        subtitle: 'Manage announcements and categories',
      },
      announcementsContent: {
        alertMessage: 'Announcement created.',
        alertMessageWithNewCategory: 'with new category',
        cancelButton: 'Cancel',
        createButton: 'Create Announcement',
        announcements: 'Announcements',
        noAnnouncementsFound: 'No announcements found',
        table: {
          title: 'Title',
          body: 'Body',
          publisher: 'Publisher',
          onBehalfOf: 'On behalf of',
          category: 'Category',
          tags: 'Tags',
          status: 'Status',
          actions: 'Actions',
          active: 'Active',
          inactive: 'Inactive',
          created_at: 'Created',
          start_at: 'Start',
          until_date: 'Until',
        },
      },
      categoriesContent: {
        createdMessage: 'created',
        deletedMessage: 'Category deleted.',
        cancelButton: 'Cancel',
        createButton: 'Create category',
        table: {
          categoryDeleted: 'Category deleted.',
          slug: 'Slug',
          title: 'Title',
          actions: 'Actions',
          addTooltip: 'Add',
          noCategoriesFound: 'No categories found.',
        },
      },
      tagsContent: {
        createdMessage: 'created',
        deletedMessage: 'Tag deleted.',
        cancelButton: 'Cancel',
        createButton: 'Create tag',
        table: {
          tagDeleted: 'Tag deleted.',
          slug: 'Slug',
          title: 'Title',
          actions: 'Actions',
          addTooltip: 'Add',
          noTagsFound: 'No tags found.',
        },
        errors: {
          alreadyExists: 'A tag with this name already exists.',
        },
      },
    },
  },
});
