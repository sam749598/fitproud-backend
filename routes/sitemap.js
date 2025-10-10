// import express from "express";
// import Blog from "../models/Blog.js"; // adjust path to your Blog model
// const router = express.Router();

// router.get("/sitemap.xml", async (req, res) => {
//   try {
//     const baseUrl = "https://vitaprozen.com";

//     // Fetch necessary fields from DB
//     const blogs = await Blog.find({}, "slug updatedAt");

//     // Static pages you always want in sitemap
//     const staticPaths = [
//       "",
//       "/about",
//       "/contact",
//       "/terms",
//       "/privacy",
//       "/affiliate-disclaimers",
//       "/blog",
      
//     ];

//     // Build XML for static pages
//     const staticUrlsXml = staticPaths
//       .map((path) => `
//         <url>
//           <loc>${baseUrl}${path}</loc>
//           <changefreq>weekly</changefreq>
//           <priority>0.8</priority>
//         </url>
//       `)
//       .join("");

//     // Build XML for blog posts
//     const postUrlsXml = blogs
//       .map((blog) => {
//         const lastmod = blog.updatedAt
//           ? blog.updatedAt.toISOString()
//           : new Date().toISOString();
//         return `
//           <url>
//             <loc>${baseUrl}/blog/${blog.slug}</loc>
//             <lastmod>${lastmod}</lastmod>
//             <changefreq>weekly</changefreq>
//             <priority>0.9</priority>
//           </url>
//         `;
//       })
//       .join("");

//     const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
//       <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//         ${staticUrlsXml}
//         ${postUrlsXml}
//       </urlset>`;

//     res.header("Content-Type", "application/xml");
//     res.send(sitemapXml);
//   } catch (err) {
//     console.error("Error generating sitemap:", err);
//     res.status(500).send("Could not generate sitemap");
//   }
// });

// export default router;



//updated


import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://www.vitaprozen.com"; // ✅ Use canonical www version

    const blogs = await Blog.find({}, "slug updatedAt");

    const staticPaths = [
      "",
      "/about",
      "/contact",
      "/terms",
      "/privacy",
      "/affiliate-disclaimers",
      "/blog",
    ];

    const staticUrlsXml = staticPaths
      .map(
        (path) => `
  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join("");

    const postUrlsXml = blogs
      .map((blog) => {
        const lastmod = blog.updatedAt
          ? blog.updatedAt.toISOString()
          : new Date().toISOString();
        return `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      })
      .join("");

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlsXml}
${postUrlsXml}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemapXml.trim());
  } catch (err) {
    console.error("Error generating sitemap:", err);
    res.status(500).send("Could not generate sitemap");
  }
});

export default router;
