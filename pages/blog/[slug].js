import { MDXRemote } from "next-mdx-remote";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import { Editframe } from "@editframe/editframe-js";
import Head from "next/head";
import redis from "../../lib/redis";

const PostPage = ({
  frontMatter: { title, description },
  mdxSource,
  video,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="video.episode" />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={video.streamUrl} />

        <meta property="og:type" content="video" />
        <meta property="og:image" content={video.thumbnailUrl} />
        <meta property="og:video" content={video.streamUrl} />
        <meta
          property="og:video:type"
          content="application/x-shockwave-flash"
        />
        <meta property="og:video:width" content="398" />
        <meta property="og:video:height" content="224" />
        <meta name="twitter:card" content="player" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:player" content={video.streamUrl} />
        <meta name="twitter:player:width" content="360" />
        <meta name="twitter:player:height" content="200" />
        <meta name="twitter:image" content={video.thumbnailUrl} />
      </Head>
      <div className="relative py-16 bg-white overflow-hidden">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-lg max-w-prose mx-auto">
            <h1 className="text-2xl font-bold">{title}</h1>

            <p className="mt-8 text-xl text-gray-500 leading-8">
              {description}
            </p>

            <div className="mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto">
              <MDXRemote {...mdxSource} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const getServerSideProps = async ({ req, res, params }) => {
  console.log(params);
  const { slug } = params;
  const fs = await import("fs").then((m) => m.default);
  const path = await import("path").then((m) => m.default); // works, does nothing
  const file = path.join(process.cwd(), "posts", slug + ".mdx"); // file is available

  const markdownWithMeta = fs.readFileSync(file, "utf-8");
  const features = await redis.hvals("features");

  console.log(features);
  const { data: frontMatter, content } = matter(markdownWithMeta);
  const mdxSource = await serialize(content);
  const editframe = new Editframe({
    clientId: process.env.EDITFRAME_CLIENT_ID,
    token: process.env.EDITFRAME_TOKEN,
  });
  const composition = await editframe.videos.new(
    // options
    {
      // any solid hexadecimal, rgb, or named color
      backgroundColor: "#000000",

      dimensions: {
        // Height in pixels
        height: 418,

        // Width in pixels
        width: 800,
      },
      duration: 15,
    }
  );

  await composition.addText(
    {
      text: frontMatter.title,
      fontSize: 40,
      color: "#ffffff",
    },
    {
      position: {
        x: "center",
        y: "center",
      },
      timeline: {
        start: 3,
      },
      trim: {
        start: 2,
        end: 15,
      },
    }
  );
  let video;
  let videoCached = await redis.get(JSON.stringify({ slug }));
  if (videoCached == null) {
    video = await composition.encode({ synchronously: true });
    if (video && video.streamUrl) {
      await redis.set(JSON.stringify({ slug }), JSON.stringify(video));
    }
  } else {
    video = JSON.parse(videoCached);
  }
  console.log(video);

  return {
    props: {
      frontMatter,
      slug,
      mdxSource,
      video,
    },
  };
};

export { getServerSideProps };
export default PostPage;
