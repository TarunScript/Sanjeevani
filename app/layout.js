import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata = {
    title: "Sanjeevani — AI Pharmacogenomic Risk Prediction",
    description:
        "AI-powered pharmacogenomic risk prediction system. Upload VCF files and get personalized drug safety assessments with CPIC-aligned recommendations.",
    keywords: "pharmacogenomics, PGx, drug safety, VCF, CPIC, precision medicine",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
