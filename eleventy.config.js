export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "docs/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "logo.svg": "logo.svg" });

  eleventyConfig.ignores.add("docs/skipped/**");

  return {
    dir: {
      input: "docs",
      output: "public"
    },
    templateFormats: ["html", "md", "njk"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
