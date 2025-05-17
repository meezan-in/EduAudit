import { Link } from "wouter";
import { CircleHelp, Shield, FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/help">
            <a className="text-neutral-400 hover:text-neutral-500 flex items-center">
              <CircleHelp className="h-5 w-5 mr-1" />
              <span className="sr-only sm:not-sr-only text-sm">Help Center</span>
            </a>
          </Link>
          <Link href="/privacy">
            <a className="text-neutral-400 hover:text-neutral-500 flex items-center">
              <Shield className="h-5 w-5 mr-1" />
              <span className="sr-only sm:not-sr-only text-sm">Privacy Policy</span>
            </a>
          </Link>
          <Link href="/terms">
            <a className="text-neutral-400 hover:text-neutral-500 flex items-center">
              <FileText className="h-5 w-5 mr-1" />
              <span className="sr-only sm:not-sr-only text-sm">Terms of Service</span>
            </a>
          </Link>
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-base text-neutral-400">&copy; {new Date().getFullYear()} EduAudit. All rights reserved.</p>
          <p className="text-center text-xs text-neutral-300 mt-1">A Karnataka Government Initiative</p>
        </div>
      </div>
    </footer>
  );
}
