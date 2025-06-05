import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>AI Outfit</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <ol>
          <li>Sample item 1: Explore new styles</li>
          <li>Sample item 2: Create your virtual wardrobe</li>
          <li>Sample item 3: Share with friends</li>
        </ol>
        <div className={styles.ctas}>
          <a href="#" className={styles.primary}>
            Get Started
          </a>
          <a href="#" className={styles.secondary}>
            Learn More
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>© 2024 AI Outfit</p>
      </footer>
    </div>
  );
}