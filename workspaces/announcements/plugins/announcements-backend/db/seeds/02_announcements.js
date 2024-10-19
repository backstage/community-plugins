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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('announcements').del();
  await knex('announcements').insert([
    {
      id: '0',
      publisher: 'default:group/developer-enablement',
      title: 'Introducing Backstage',
      excerpt: 'The developer enablement team is exited to announce Backstage!',
      body: `Backstage is an open platform for building developer portals. Powered by a centralized software catalog, Backstage restores order to your microservices and infrastructure and enables your product teams to ship high-quality code quickly — without compromising autonomy. Backstage unifies all your infrastructure tooling, services, and documentation to create a streamlined development environment from end to end.`,
      created_at: '2020-01-02T15:28:08.539+00:00',
      category: 'internal-developer-portal',
      active: 1,
    },
    {
      id: '1',
      publisher: 'default:group/sre',
      title: 'New DORA Metrics',
      excerpt: 'Q1 DORA metrics are here',
      body: 'The DevOps Research and Assessment (DORA) team was founded in 2014 as an independent research group focused on investigating the practices and capabilities that drive high performance in software delivery and financial results. The DORA team is known for the annual State of DevOps report that has been published for seven consecutive years, from 2014 to 2021. In 2019, DORA was acquired by Google.',
      created_at: '2021-03-02T04:30:08.539+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '2',
      publisher: 'default:user/guest',
      title: 'Community blog post',
      excerpt: 'How to scale your infrastructure',
      body: `Today we will dive into some strategies you can use to scale Ruby on Rails applications to a huge user base.

      One obvious way of scaling applications is to throw more money at them. And it works amazingly well — add a few more servers, upgrade your database server, and voila, a lot of the performance issues just go poof!
      
      But it is often also possible to scale applications without adding more servers. That's what we will discuss today.
      
      Let's get going!
      
      Randomly taken from [this](https://blog.appsignal.com/2022/11/09/how-to-scale-ruby-on-rails-applications.html) blog post.
      `,
      category: 'infrastructure',
      created_at: '2021-03-17T18:28:08.539+00:00',
      active: 1,
    },
    {
      id: '3',
      publisher: 'default:group/incident-management',
      title: 'Incident Response Metrics',
      excerpt: 'Quarterly respone metrics',
      body: 'You will find the incident response metrics for the last quarter here. Our average time to resolve an incident is 2 hours. We are aiming to reduce this to 1 hour by the end of the year.',
      created_at: '2022-01-02T15:28:08.539+00:00',
      active: 1,
    },
    {
      id: '4',
      publisher: 'default:user/kurtaking',
      title: 'What a wonderful announcement',
      excerpt: 'Happy to announce this announcement',
      body: 'We are happy to announce the new Announcements feature!',
      created_at: '2022-02-04T14:47:08.539+00:00',
      active: 1,
    },
    {
      id: '5',
      publisher: 'default:group/developer-enablement',
      title: 'Introducing Software Catalog',
      excerpt: 'Thank you Spotify. The Software Catalog is here!',
      body: 'The Backstage Software Catalog is a centralized system that keeps track of ownership and metadata for all the software in your ecosystem (services, websites, libraries, data pipelines, etc). The catalog is built around the concept of metadata YAML files stored together with the code, which are then harvested and visualized in Backstage.',
      created_at: '2022-03-26T01:28:08.539+00:00',
      category: 'internal-developer-portal',
      active: 1,
    },
    {
      id: '6',
      publisher: 'default:group/sre',
      title: 'New feature: Announcements',
      excerpt: 'We are happy to announce the new Announcements feature!',
      body: 'We are happy to announce the new Announcements feature!',
      created_at: '2022-04-04T01:28:08.539+00:00',
      active: 1,
    },
    {
      id: '7',
      publisher: 'default:user/guest',
      title: 'Required upgrade to Node 18',
      excerpt: 'All services are required to upgrade to Node 18',
      body: 'Service leveraging node are required to upgrade to Node 18 by the end of the month. Please contact the platform team if you have any questions.',
      category: 'javascript',
      created_at: '2023-02-26T01:52:01.539+00:00',
      active: 1,
    },
    {
      id: '8',
      publisher: 'default:user/guest',
      title: 'Lorem Ipsum: A really long announcement example',
      excerpt: 'A long announcement!',
      body: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
      created_at: '2023-03-01T03:28:08.539+00:00',
      category: 'product-updates',
      active: 1,
    },
    {
      id: '9',
      publisher: 'default:group/documentation',
      title: 'Documentation, upgrading to TechDocs',
      excerpt:
        'TechDocs is Spotify’s homegrown docs-like-code solution built directly into Backstage.',
      body: 'TechDocs is Spotify’s homegrown docs-like-code solution built directly into Backstage. Engineers write their documentation in Markdown files which live together with their code - and with little configuration get a nice-looking doc site in Backstage. Today, it is one of the core products in Spotify’s developer experience offering with 5000+ documentation sites and around 10000 average daily hits. Read more about TechDocs in its announcement blog post. 🎉 More info [here](https://backstage.io/docs/features/techdocs/)',
      created_at: '2023-04-15T01:28:08.539+00:00',
      category: 'product-updates',
      active: 1,
    },
    {
      id: '10',
      publisher: 'default:group/cloud-provisioning',
      title: 'Brownout: Service A',
      excerpt: 'Service A will be browned out for 2 hours',
      body: 'Service A will be browned out for 2 hours. Please contact the environments team if you have any questions.',
      created_at: '2023-06-04T01:28:08.539+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '11',
      publisher: 'default:group/team-environments',
      title: 'Scheduled Maintenance: Database Upgrade',
      excerpt:
        'We will be performing a scheduled maintenance to upgrade the database',
      body: 'We will be performing a scheduled maintenance to upgrade the database. During this time, there may be temporary service disruptions. We apologize for any inconvenience caused.',
      created_at: '2023-06-10T08:00:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '12',
      publisher: 'default:group/developer-enablement',
      title: 'New Feature: Code Review Checklist',
      excerpt: 'Introducing the Code Review Checklist feature',
      body: 'We are excited to introduce the Code Review Checklist feature. This feature provides a standardized checklist for code reviews, helping to improve code quality and maintain consistency across the organization.',
      created_at: '2023-06-15T14:30:00.000+00:00',
      category: 'internal-developer-portal',
      active: 1,
    },
    {
      id: '13',
      publisher: 'default:user/guest',
      title: 'Upcoming Webinar: Introduction to Backstage',
      excerpt: 'Join us for a webinar on the basics of Backstage',
      body: "We invite you to join us for an upcoming webinar on the basics of Backstage. This webinar is designed for both new and existing users who want to learn more about the features and capabilities of Backstage. Don't miss out!",
      created_at: '2023-06-20T10:00:00.000+00:00',
      active: 1,
    },
    {
      id: '14',
      publisher: 'default:group/sre',
      title: 'New Monitoring Dashboard',
      excerpt: 'Introducing the new Monitoring Dashboard',
      body: 'We are pleased to announce the release of the new Monitoring Dashboard. This dashboard provides real-time visibility into the health and performance of our systems, allowing us to proactively identify and resolve issues. Check it out!',
      created_at: '2023-06-25T16:45:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '15',
      publisher: 'default:user/guest',
      title: 'Security Alert: Vulnerability Patch',
      excerpt: 'Action required: Apply the latest security patch',
      body: 'A critical security vulnerability has been discovered in our system. It is important that all users apply the latest security patch immediately to protect against potential exploits. Please follow the provided instructions to apply the patch.',
      created_at: '2023-06-30T09:15:00.000+00:00',
      category: 'security',
      active: 1,
    },
    {
      id: '16',
      publisher: 'default:group/documentation',
      title: 'New Tutorial: Getting Started with Backstage',
      excerpt: 'Learn how to get started with Backstage',
      body: 'We have published a new tutorial that provides a step-by-step guide on getting started with Backstage. Whether you are a beginner or an experienced user, this tutorial will help you quickly set up and navigate the Backstage platform. Happy learning!',
      created_at: '2023-07-05T13:30:00.000+00:00',
      category: 'documentation',
      active: 1,
    },
    {
      id: '17',
      publisher: 'default:group/team-environments',
      title: 'Planned Outage: Service B',
      excerpt: 'Service B will be temporarily unavailable due to maintenance',
      body: 'We will be performing maintenance on Service B, which will result in a temporary outage. We apologize for any inconvenience caused and assure you that we are working diligently to minimize the impact and restore service as quickly as possible.',
      created_at: '2023-07-10T07:45:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '18',
      publisher: 'default:group/sre',
      title: 'New Feature: Automated Incident Response',
      excerpt: 'Introducing the Automated Incident Response feature',
      body: 'We are excited to announce the release of the Automated Incident Response feature. This feature leverages machine learning algorithms to automatically detect and respond to incidents, reducing response times and improving overall system reliability. Try it out!',
      created_at: '2023-07-15T15:00:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '19',
      publisher: 'default:user/guest',
      title: 'Upcoming Conference: Backstage Connect',
      excerpt: 'Join us for the annual Backstage Connect conference',
      body: "We are thrilled to invite you to the annual Backstage Connect conference. This conference brings together industry experts, thought leaders, and Backstage users from around the world to share insights, best practices, and success stories. Don't miss this opportunity to connect and learn!",
      created_at: '2023-07-20T11:30:00.000+00:00',
      category: 'events',
      active: 1,
    },
    {
      id: '20',
      publisher: 'default:group/developer-enablement',
      title: 'New Feature: API Documentation Generator',
      excerpt: 'Introducing the API Documentation Generator',
      body: 'We are pleased to introduce the API Documentation Generator, a powerful tool that automatically generates comprehensive documentation for your APIs. With this feature, you can easily keep your API documentation up to date and ensure that developers have the information they need to integrate with your services.',
      created_at: '2023-07-25T17:15:00.000+00:00',
      category: 'internal-developer-portal',
      active: 1,
    },
    {
      id: '21',
      publisher: 'default:user/guest',
      title: 'Important Announcement: System Upgrade',
      excerpt: 'We will be performing a system upgrade',
      body: 'We will be performing a system upgrade to enhance performance and introduce new features. During this time, there may be temporary service disruptions. We apologize for any inconvenience caused and appreciate your patience.',
      created_at: '2023-07-30T10:45:00.000+00:00',
      active: 1,
    },
    {
      id: '22',
      publisher: 'default:group/sre',
      title: 'New Feature: Incident Analysis Dashboard',
      excerpt: 'Introducing the Incident Analysis Dashboard',
      body: 'We are excited to announce the release of the Incident Analysis Dashboard. This dashboard provides detailed insights into past incidents, allowing us to analyze root causes, identify trends, and implement preventive measures. Explore the dashboard and gain valuable insights!',
      created_at: '2023-08-04T16:30:00.000+00:00',
      active: 1,
    },
    {
      id: '23',
      publisher: 'default:user/guest',
      title: 'Webinar Recap: Backstage Best Practices',
      excerpt: 'Missed the webinar? Read the recap of Backstage best practices',
      body: 'In case you missed our recent webinar on Backstage best practices, we have prepared a recap for you. This recap highlights key takeaways, tips, and tricks shared during the webinar. Catch up on the latest best practices and make the most out of Backstage!',
      created_at: '2023-08-09T12:00:00.000+00:00',
      category: 'documentation',
      active: 1,
    },
    {
      id: '24',
      publisher: 'default:group/team-environments',
      title: 'Planned Maintenance: Network Upgrade',
      excerpt: 'We will be upgrading the network infrastructure',
      body: 'We will be performing a planned maintenance to upgrade our network infrastructure. This upgrade will enhance network performance and reliability. During the maintenance window, there may be intermittent connectivity issues. We apologize for any inconvenience caused.',
      created_at: '2023-08-14T08:30:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '25',
      publisher: 'default:group/developer-enablement',
      title: 'New Feature: Test Coverage Analyzer',
      excerpt: 'Introducing the Test Coverage Analyzer',
      body: 'We are thrilled to introduce the Test Coverage Analyzer, a powerful tool that helps you measure and improve test coverage in your codebase. With this feature, you can identify areas of your code that lack proper test coverage and take necessary actions to ensure code quality.',
      created_at: '2023-08-19T14:45:00.000+00:00',
      category: 'internal-developer-portal',
      active: 1,
    },
    {
      id: '26',
      publisher: 'default:user/guest',
      title: 'Upcoming Workshop: Backstage Deep Dive',
      excerpt: 'Join us for an in-depth workshop on Backstage',
      body: "We are excited to invite you to an upcoming workshop on Backstage. This workshop is designed for intermediate and advanced users who want to dive deeper into the advanced features and customization options of Backstage. Don't miss this opportunity to expand your Backstage knowledge!",
      created_at: '2023-08-24T10:15:00.000+00:00',
      category: 'events',
      active: 1,
    },
    {
      id: '27',
      publisher: 'default:group/sre',
      title: 'New Feature: Anomaly Detection',
      excerpt: 'Introducing the Anomaly Detection feature',
      body: 'We are pleased to announce the release of the Anomaly Detection feature. This feature leverages machine learning algorithms to automatically detect anomalies in system metrics, helping us identify potential issues before they impact the user experience. Try it out and stay ahead of potential problems!',
      created_at: '2023-08-29T16:00:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '28',
      publisher: 'default:user/guest',
      title: 'Important Update: Service Deprecation',
      excerpt: 'Service X will be deprecated in the upcoming release',
      body: 'In the upcoming release, we will be deprecating Service X. This means that Service X will no longer receive updates or support. We recommend migrating to alternative solutions as soon as possible to avoid any disruptions. Please reach out to the support team if you have any questions.',
      created_at: '2023-09-03T09:30:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '29',
      publisher: 'default:group/documentation',
      title: 'New Tutorial: Advanced Backstage Customization',
      excerpt: 'Learn advanced customization techniques for Backstage',
      body: "We have published a new tutorial that explores advanced customization techniques for Backstage. This tutorial covers topics such as theming, plugin development, and extending Backstage's core functionality. Take your Backstage customization skills to the next level!",
      created_at: '2023-09-08T15:45:00.000+00:00',
      category: 'documentation',
      active: 1,
    },
    {
      id: '30',
      publisher: 'default:group/team-environments',
      title: 'Planned Outage: Service C',
      excerpt: 'Service C will be temporarily unavailable due to maintenance',
      body: 'We will be performing maintenance on Service C, which will result in a temporary outage. We apologize for any inconvenience caused and assure you that we are working diligently to minimize the impact and restore service as quickly as possible.',
      created_at: '2023-09-13T11:00:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '31',
      publisher: 'default:group/sre',
      title: 'New Feature: Auto Scaling',
      excerpt: 'Introducing the Auto Scaling feature',
      body: 'We are excited to announce the release of the Auto Scaling feature. This feature automatically adjusts the number of resources allocated to a service based on demand, ensuring optimal performance and cost efficiency. Experience the benefits of automatic scaling!',
      created_at: '2023-09-18T17:15:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '32',
      publisher: 'default:user/guest',
      title: 'Webinar Recap: Backstage Plugin Development',
      excerpt:
        'Missed the webinar? Read the recap of Backstage plugin development',
      body: 'In case you missed our recent webinar on Backstage plugin development, we have prepared a recap for you. This recap highlights key takeaways, best practices, and examples shared during the webinar. Catch up on the latest plugin development techniques and enhance your Backstage experience!',
      created_at: '2023-09-23T12:30:00.000+00:00',
      category: 'documentation',
      active: 1,
    },
    {
      id: '33',
      publisher: 'default:group/developer-enablement',
      title: 'New Feature: Performance Profiler',
      excerpt: 'Introducing the Performance Profiler',
      body: 'We are thrilled to introduce the Performance Profiler, a powerful tool that helps you analyze and optimize the performance of your applications. With this feature, you can identify performance bottlenecks, optimize resource usage, and deliver faster and more efficient applications.',
      created_at: '2023-09-28T08:45:00.000+00:00',
      category: 'internal-developer-portal',
      active: 1,
    },
    {
      id: '34',
      publisher: 'default:user/guest',
      title: 'Upcoming Conference: Backstage Innovate',
      excerpt: 'Join us for the annual Backstage Innovate conference',
      body: "We are thrilled to invite you to the annual Backstage Innovate conference. This conference brings together industry leaders, innovators, and Backstage enthusiasts to explore the latest trends, technologies, and use cases of Backstage. Don't miss this opportunity to connect and innovate!",
      created_at: '2023-10-03T15:00:00.000+00:00',
      category: 'events',
      active: 1,
    },
    {
      id: '35',
      publisher: 'default:group/observability',
      title: 'New Feature: Log Analysis',
      excerpt: 'Introducing the Log Analysis feature',
      body: 'We are pleased to announce the release of the Log Analysis feature. This feature provides powerful log search and analysis capabilities, allowing us to quickly identify and troubleshoot issues. Dive into your logs and gain valuable insights!',
      created_at: '2023-10-08T11:15:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '36',
      publisher: 'default:user/guest',
      title: 'Important Announcement: Service Migration',
      excerpt: 'Service Y will be migrated to a new infrastructure',
      body: 'We will be migrating Service Y to a new infrastructure to improve performance and reliability. During the migration, there may be temporary service disruptions. We apologize for any inconvenience caused and appreciate your understanding.',
      created_at: '2023-10-13T17:30:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '37',
      publisher: 'default:group/documentation',
      title: 'New Tutorial: Backstage Custom Plugin Development',
      excerpt: 'Learn how to develop custom plugins for Backstage',
      body: 'We have published a new tutorial that guides you through the process of developing custom plugins for Backstage. This tutorial covers plugin architecture, API integration, and best practices for plugin development. Start building your own custom plugins today!',
      created_at: '2023-10-18T13:45:00.000+00:00',
      category: 'documentation',
      active: 1,
    },
    {
      id: '38',
      publisher: 'default:group/team-environments',
      title: 'Planned Outage: Service D',
      excerpt: 'Service D will be temporarily unavailable due to maintenance',
      body: 'We will be performing maintenance on Service D, which will result in a temporary outage. We apologize for any inconvenience caused and assure you that we are working diligently to minimize the impact and restore service as quickly as possible.',
      created_at: '2023-10-23T10:00:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '39',
      publisher: 'default:group/platform-engineering',
      title: 'New Feature: Distributed Tracing',
      excerpt: 'Introducing the Distributed Tracing feature',
      body: 'We are excited to announce the release of the Distributed Tracing feature. This feature provides end-to-end visibility into the flow of requests across distributed systems, helping us identify performance bottlenecks and optimize system performance. Trace your requests and gain valuable insights!',
      created_at: '2023-10-28T16:15:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '40',
      publisher: 'default:user/security',
      title: 'Webinar Recap: Backstage Security Best Practices',
      excerpt:
        'Missed the webinar? Read the recap of Backstage security best practices',
      body: 'In case you missed our recent webinar on Backstage security best practices, we have prepared a recap for you. This recap highlights key takeaways, security measures, and recommendations shared during the webinar. Stay informed and protect your Backstage instance!',
      created_at: '2023-11-02T12:30:00.000+00:00',
      category: 'documentation',
      active: 1,
    },
    {
      id: '41',
      publisher: 'default:group/team-environments',
      title: 'New Feature: Environment Variables',
      excerpt: 'Introducing the Environment Variables feature',
      body: 'We are excited to introduce the Environment Variables feature. This feature allows you to manage and configure environment-specific variables for your services, making it easier to handle different environments and deployments. Simplify your configuration management with environment variables!',
      created_at: '2023-11-07T09:15:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '42',
      publisher: 'default:group/sre',
      title: 'Planned Outage: Service E',
      excerpt: 'Service E will be temporarily unavailable due to maintenance',
      body: 'We will be performing maintenance on Service E, which will result in a temporary outage. We apologize for any inconvenience caused and assure you that we are working diligently to minimize the impact and restore service as quickly as possible.',
      created_at: '2023-11-12T14:30:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '43',
      publisher: 'default:user/guest',
      title: 'New Tutorial: Backstage Plugin Testing',
      excerpt: 'Learn how to test your Backstage plugins',
      body: 'We have published a new tutorial that guides you through the process of testing your Backstage plugins. This tutorial covers unit testing, integration testing, and best practices for plugin testing. Ensure the quality and reliability of your plugins with comprehensive testing!',
      created_at: '2023-11-17T11:45:00.000+00:00',
      category: 'documentation',
      active: 1,
    },
    {
      id: '44',
      publisher: 'default:group/developer-enablement',
      title: 'New Feature: API Documentation',
      excerpt: 'Introducing the API Documentation feature',
      body: 'We are pleased to announce the release of the API Documentation feature. This feature provides a centralized location to document and explore APIs used in your services. Easily access API specifications, examples, and usage guidelines. Streamline your API documentation process!',
      created_at: '2023-11-22T17:00:00.000+00:00',
      category: 'documentation',
      active: 1,
    },
    {
      id: '45',
      publisher: 'default:user/guest',
      title: 'Upcoming Conference: Backstage Connect',
      excerpt: 'Join us for the annual Backstage Connect conference',
      body: "We are thrilled to invite you to the annual Backstage Connect conference. This conference brings together Backstage users, contributors, and experts to share knowledge, network, and collaborate. Don't miss this opportunity to connect with the Backstage community!",
      created_at: '2023-11-27T13:15:00.000+00:00',
      category: 'events',
      active: 1,
    },
    {
      id: '46',
      publisher: 'default:group/observability',
      title: 'New Feature: Error Monitoring',
      excerpt: 'Introducing the Error Monitoring feature',
      body: 'We are excited to announce the release of the Error Monitoring feature. This feature provides real-time error tracking and monitoring capabilities, allowing you to proactively identify and resolve issues in your applications. Stay on top of errors and deliver reliable software!',
      created_at: '2023-12-02T09:30:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '47',
      publisher: 'default:user/guest',
      title: 'Important Announcement: Service Migration',
      excerpt: 'Service Z will be migrated to a new infrastructure',
      body: 'We will be migrating Service Z to a new infrastructure to improve performance and reliability. During the migration, there may be temporary service disruptions. We apologize for any inconvenience caused and appreciate your understanding.',
      created_at: '2023-12-07T15:45:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '48',
      publisher: 'default:group/documentation',
      title: 'New Tutorial: Backstage Plugin Deployment',
      excerpt: 'Learn how to deploy your Backstage plugins',
      body: 'We have published a new tutorial that guides you through the process of deploying your Backstage plugins. This tutorial covers different deployment strategies, CI/CD integration, and best practices for plugin deployment. Deploy your plugins with confidence!',
      created_at: '2023-12-12T12:00:00.000+00:00',
      category: 'documentation',
      active: 1,
    },
    {
      id: '49',
      publisher: 'default:group/team-environments',
      title: 'Planned Outage: Service F',
      excerpt: 'Service F will be temporarily unavailable due to maintenance',
      body: 'We will be performing maintenance on Service F, which will result in a temporary outage. We apologize for any inconvenience caused and assure you that we are working diligently to minimize the impact and restore service as quickly as possible.',
      created_at: '2023-12-17T08:15:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
    {
      id: '50',
      publisher: 'default:group/platform-engineering',
      title: 'New Feature: Service Mesh Integration',
      excerpt: 'Introducing the Service Mesh Integration feature',
      body: 'We are excited to announce the release of the Service Mesh Integration feature. This feature enables seamless integration with popular service mesh solutions, providing advanced traffic management, security, and observability capabilities. Enhance your microservices architecture with service mesh integration!',
      created_at: '2023-12-22T14:30:00.000+00:00',
      category: 'infrastructure',
      active: 1,
    },
  ]);
};
