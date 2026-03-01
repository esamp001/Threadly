exports.seed = async function (knex) {
  // Delete existing
  await knex('topics').del();

  // Insert topics with fixed IDs
  await knex('topics').insert([
    { id: 1, name: "Technology", slug: "technology", description: "Programming, AI, software, gadgets, and innovation.", icon: "ri-cpu-line" },
    { id: 2, name: "Business", slug: "business", description: "Startups, entrepreneurship, finance, and investing.", icon: "ri-briefcase-line" },
    { id: 3, name: "Gaming", slug: "gaming", description: "Video games, esports, and gaming culture.", icon: "ri-gamepad-line" },
    { id: 4, name: "Education", slug: "education", description: "Learning resources, study tips, and academic discussions.", icon: "ri-book-open-line" },
    { id: 5, name: "Art & Creativity", slug: "art-creativity", description: "Design, photography, writing, and creative projects.", icon: "ri-palette-line" },
    { id: 6, name: "Health & Fitness", slug: "health-fitness", description: "Workout routines, nutrition, and wellness advice.", icon: "ri-heart-pulse-line" },
    { id: 7, name: "Lifestyle", slug: "lifestyle", description: "Daily life, hobbies, and experiences.", icon: "ri-home-4-line" },
    { id: 8, name: "Science", slug: "science", description: "Research, discoveries, and scientific discussions.", icon: "ri-flask-line" },
    { id: 9, name: "Entertainment", slug: "entertainment", description: "Movies, TV shows, music, and pop culture.", icon: "ri-film-line" },
    { id: 10, name: "News", slug: "news", description: "Current events and global updates.", icon: "ri-newspaper-line" },
    { id: 11, name: "Sports", slug: "sports", description: "Professional sports and athletic performance.", icon: "ri-football-line" },
    { id: 12, name: "General", slug: "general", description: "Open discussions on any topic.", icon: "ri-chat-3-line" },

    { id: 13, name: "Web Development", slug: "web-development", description: "Frontend, backend, and full-stack development.", icon: "ri-code-line" },
    { id: 14, name: "Mobile Development", slug: "mobile-development", description: "iOS, Android, and cross-platform apps.", icon: "ri-smartphone-line" },
    { id: 15, name: "Cybersecurity", slug: "cybersecurity", description: "Security, ethical hacking, and privacy.", icon: "ri-shield-keyhole-line" },
    { id: 16, name: "Data Science", slug: "data-science", description: "Data analysis, ML, and big data.", icon: "ri-database-2-line" },
    { id: 17, name: "Artificial Intelligence", slug: "artificial-intelligence", description: "AI, machine learning, and automation.", icon: "ri-robot-line" },
    { id: 18, name: "DevOps & Cloud", slug: "devops-cloud", description: "Cloud platforms and infrastructure.", icon: "ri-cloud-line" },

    { id: 19, name: "Investing", slug: "investing", description: "Stocks, crypto, and financial markets.", icon: "ri-line-chart-line" },
    { id: 20, name: "Personal Finance", slug: "personal-finance", description: "Saving, budgeting, and money management.", icon: "ri-wallet-3-line" },
    { id: 21, name: "Cryptocurrency", slug: "cryptocurrency", description: "Blockchain and digital assets.", icon: "ri-bit-coin-line" },

    { id: 22, name: "Photography", slug: "photography", description: "Cameras, editing, and visual storytelling.", icon: "ri-camera-line" },
    { id: 23, name: "Writing", slug: "writing", description: "Stories, blogging, and creative writing.", icon: "ri-quill-pen-line" },
    { id: 24, name: "Music", slug: "music", description: "Production, instruments, and artists.", icon: "ri-music-2-line" },
    { id: 25, name: "Graphic Design", slug: "graphic-design", description: "Branding, UI/UX, and visual design.", icon: "ri-brush-line" },

    { id: 26, name: "Self Improvement", slug: "self-improvement", description: "Productivity and personal growth.", icon: "ri-rocket-line" },
    { id: 27, name: "Mental Health", slug: "mental-health", description: "Well-being and emotional support.", icon: "ri-mental-health-line" },
    { id: 28, name: "Career", slug: "career", description: "Job advice and professional growth.", icon: "ri-user-star-line" },

    { id: 29, name: "Politics", slug: "politics", description: "Political discussions and policies.", icon: "ri-government-line" },
    { id: 30, name: "History", slug: "history", description: "Past events and historical analysis.", icon: "ri-time-line" },
    { id: 31, name: "Philosophy", slug: "philosophy", description: "Ideas, ethics, and deep thinking.", icon: "ri-lightbulb-line" },
    { id: 32, name: "Religion & Spirituality", slug: "religion-spirituality", description: "Faith and spiritual discussions.", icon: "ri-sun-line" },

    { id: 33, name: "Food & Cooking", slug: "food-cooking", description: "Recipes and culinary discussions.", icon: "ri-restaurant-line" },
    { id: 34, name: "Travel", slug: "travel", description: "Destinations and travel tips.", icon: "ri-plane-line" },
    { id: 35, name: "Fashion", slug: "fashion", description: "Style and clothing trends.", icon: "ri-t-shirt-line" },
    { id: 36, name: "Parenting", slug: "parenting", description: "Family and raising children.", icon: "ri-parent-line" },
    { id: 37, name: "Relationships", slug: "relationships", description: "Dating and relationship advice.", icon: "ri-heart-line" },

    { id: 38, name: "Anime & Manga", slug: "anime-manga", description: "Japanese animation and comics.", icon: "ri-tv-2-line" },
    { id: 39, name: "Memes & Humor", slug: "memes-humor", description: "Funny content and internet humor.", icon: "ri-emotion-laugh-line" },
    { id: 40, name: "Pets & Animals", slug: "pets-animals", description: "Animal lovers and pet care.", icon: "ri-bear-smile-line" },
    { id: 41, name: "DIY & Crafts", slug: "diy-crafts", description: "Do-it-yourself projects and crafts.", icon: "ri-tools-line" },
    { id: 42, name: "Automotive", slug: "automotive", description: "Cars, motorcycles, and vehicles.", icon: "ri-car-line" },
    { id: 43, name: "Books & Literature", slug: "books-literature", description: "Reading and literary discussions.", icon: "ri-book-2-line" },
    { id: 44, name: "Environment", slug: "environment", description: "Climate and sustainability.", icon: "ri-earth-line" },
    { id: 45, name: "Startups", slug: "startups", description: "Building and scaling new businesses.", icon: "ri-rocket-2-line" }
  ]);

  // Reset ID sequence (VERY IMPORTANT for PostgreSQL)
  await knex.raw(`
    SELECT setval('topics_id_seq', (SELECT MAX(id) FROM topics));
  `);
}