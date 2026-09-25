export interface StarterPrompt {
  icon: string;
  text: string;
}

export interface CoursePrompts {
  course: string;
  prompts: StarterPrompt[];
}

export const COURSE_PROMPTS: CoursePrompts[] = [
  {
    course: "Programming 1",
    prompts: [
      { icon: "Hash", text: "I want a program that checks if a number is odd or even" },
      { icon: "CaseSensitive", text: "Count how many vowels are in a string the user types in" },
      { icon: "ClipboardList", text: "Sort a list of student names alphabetically" },
      { icon: "LockKeyhole", text: "Check if a password is strong enough" },
      { icon: "FolderOpen", text: "Read names from a text file and print them in order" },
      { icon: "Repeat", text: "Print the multiplication table for a number using a loop" },
      { icon: "Landmark", text: "Make a class for a bank account with deposit and withdraw" },
      { icon: "BookOpen", text: "I have this code but I don't understand what it does" },
      { icon: "Dices", text: "Pick a random item from a list and remove it" },
      { icon: "Calculator", text: "Calculate the average of a list of numbers, ignoring zeros" },
    ],
  },
  {
    course: "Data Structures",
    prompts: [
      { icon: "Library", text: "Implement a stack using a singly linked list" },
      { icon: "RefreshCw", text: "Reverse a singly linked list in place" },
      { icon: "Infinity", text: "Write a recursive function to compute Fibonacci numbers" },
      { icon: "GitBranch", text: "Insert a value into a binary search tree" },
      { icon: "Search", text: "Search for a value in a BST and return the node" },
      { icon: "Database", text: "Implement a hash map with chaining for collision handling" },
      { icon: "ListX", text: "Remove duplicates from an array without using a set" },
      { icon: "MailOpen", text: "Implement a queue using two stacks" },
      { icon: "Timer", text: "Explain the time complexity of bubble sort vs merge sort" },
      { icon: "Link", text: "Delete a node from a doubly linked list" },
    ],
  },
];
