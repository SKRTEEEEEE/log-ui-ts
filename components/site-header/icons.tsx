import {
  BookOpen,
  Code2,
  Github,
  Home,
  Laptop,
  Menu,
  Moon,
  Sun,
  Twitter,
  X,
} from "lucide-react"

export const Icons = {
  logo: Laptop,
  close: X,
  menu: Menu,
  sun: Sun,
  moon: Moon,
  twitter: Twitter,
  gitHub: Github,
  home: Home,
  code: Code2,
  book: BookOpen,
}

export type Icon = keyof typeof Icons
