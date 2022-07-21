import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import Image from "next/image";

const Home = ({ posts }) => {
  return (
    <div className="mt-5">
      <div className="relative  pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
              From the blog
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsa
              libero labore natus atque, ducimus sed.
            </p>
          </div>
          <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
            {posts.map((post, index) => (
              <div
                key={index}
                className="flex flex-col rounded-lg shadow-lg overflow-hidden"
              >
                <div className="flex-shrink-0">
                  <Image
                    src={post.frontMatter.thumbnailUrl}
                    className="h-48 w-full object-cover"
                    alt="thumbnail"
                    width={500}
                    height={400}
                    objectFit="cover"
                  />
                </div>
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600">
                      {post.frontMatter.date}
                    </p>
                    <Link
                      href={"/blog/" + post.slug}
                      passHref
                      className="block mt-2"
                    >
                      <p className="text-xl font-semibold text-gray-900">
                        {post.frontMatter.title}
                      </p>
                    </Link>
                    <p className="mt-3 text-base text-gray-500">
                      {post.frontMatter.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getStaticProps = async () => {
  const files = fs.readdirSync(path.join("posts"));

  const posts = files.map((filename) => {
    const markdownWithMeta = fs.readFileSync(
      path.join("posts", filename),
      "utf-8"
    );
    const { data: frontMatter } = matter(markdownWithMeta);

    return {
      frontMatter,
      slug: filename.split(".")[0],
    };
  });

  return {
    props: {
      posts,
    },
  };
};

export default Home;
