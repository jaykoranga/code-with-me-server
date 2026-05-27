require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const { Question } = require("../src/models/question.model");

const questions = [
  {
    name: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    difficulty: "easy",
    category: ["Array", "Hash Table"],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]"
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]"
      }
    ],
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        output: "[0,1]",
        visibility: "public"
      },
      {
        input: "[3,2,4]\n6",
        output: "[1,2]",
        visibility: "public"
      },
      {
        input: "[3,3]\n6",
        output: "[0,1]",
        visibility: "hidden"
      }
    ],
    boilerPlate: [
      {
        language: "javascript",
        code: "function twoSum(nums, target) {\n  // Write your code here\n}",
        description: "Two Sum boilerplate code in JavaScript"
      }
    ]
  },
  {
    name: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    difficulty: "easy",
    category: ["Two Pointers", "String"],
    constraints: [
      "1 <= s.length <= 10^5",
      "s[i] is a printable ascii character."
    ],
    examples: [
      {
        input: "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]",
        output: "[\"o\",\"l\",\"l\",\"e\",\"h\"]"
      }
    ],
    testCases: [
      {
        input: "[\"h\",\"e\",\"l\",\"l\",\"o\"]",
        output: "[\"o\",\"l\",\"l\",\"e\",\"h\"]",
        visibility: "public"
      },
      {
        input: "[\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]",
        output: "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]",
        visibility: "public"
      }
    ],
    boilerPlate: [
      {
        language: "javascript",
        code: "function reverseString(s) {\n  // Write your code here\n}",
        description: "Reverse String boilerplate code in JavaScript"
      }
    ]
  },
  {
    name: "Palindrome Number",
    description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
    difficulty: "easy",
    category: ["Math"],
    constraints: [
      "-2^31 <= x <= 2^31 - 1"
    ],
    examples: [
      {
        input: "x = 121",
        output: "true"
      },
      {
        input: "x = -121",
        output: "false"
      }
    ],
    testCases: [
      {
        input: "121",
        output: "true",
        visibility: "public"
      },
      {
        input: "-121",
        output: "false",
        visibility: "public"
      },
      {
        input: "10",
        output: "false",
        visibility: "hidden"
      }
    ],
    boilerPlate: [
      {
        language: "javascript",
        code: "function isPalindrome(x) {\n  // Write your code here\n}",
        description: "Palindrome Number boilerplate code in JavaScript"
      }
    ]
  },
  {
    name: "Fizz Buzz",
    description: "Given an integer `n`, return a string array `answer` (1-indexed) where:\n- `answer[i] == \"FizzBuzz\"` if `i` is divisible by 3 and 5.\n- `answer[i] == \"Fizz\"` if `i` is divisible by 3.\n- `answer[i] == \"Buzz\"` if `i` is divisible by 5.\n- `answer[i] == i` (as a string) if none of the above conditions are true.",
    difficulty: "easy",
    category: ["Math", "String", "Simulation"],
    constraints: [
      "1 <= n <= 10^4"
    ],
    examples: [
      {
        input: "n = 3",
        output: "[\"1\",\"2\",\"Fizz\"]"
      },
      {
        input: "n = 5",
        output: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]"
      }
    ],
    testCases: [
      {
        input: "3",
        output: "[\"1\",\"2\",\"Fizz\"]",
        visibility: "public"
      },
      {
        input: "5",
        output: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]",
        visibility: "public"
      },
      {
        input: "15",
        output: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",\"Fizz\",\"7\",\"8\",\"Fizz\",\"Buzz\",\"11\",\"Fizz\",\"13\",\"14\",\"FizzBuzz\"]",
        visibility: "hidden"
      }
    ],
    boilerPlate: [
      {
        language: "javascript",
        code: "function fizzBuzz(n) {\n  // Write your code here\n}",
        description: "Fizz Buzz boilerplate code in JavaScript"
      }
    ]
  },
  {
    name: "Fibonacci Number",
    description: "The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\n\nGiven `n`, calculate `F(n)`.",
    difficulty: "easy",
    category: ["Math", "Dynamic Programming", "Recursion"],
    constraints: [
      "0 <= n <= 30"
    ],
    examples: [
      {
        input: "n = 2",
        output: "1"
      },
      {
        input: "n = 3",
        output: "2"
      }
    ],
    testCases: [
      {
        input: "2",
        output: "1",
        visibility: "public"
      },
      {
        input: "3",
        output: "2",
        visibility: "public"
      },
      {
        input: "4",
        output: "3",
        visibility: "hidden"
      }
    ],
    boilerPlate: [
      {
        language: "javascript",
        code: "function fib(n) {\n  // Write your code here\n}",
        description: "Fibonacci Number boilerplate code in JavaScript"
      }
    ]
  },
  {
    name: "Valid Parentheses",
    description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    difficulty: "easy",
    category: ["String", "Stack"],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    examples: [
      {
        input: "s = \"()\"",
        output: "true"
      },
      {
        input: "s = \"()[]{}\"",
        output: "true"
      }
    ],
    testCases: [
      {
        input: "\"()\"",
        output: "true",
        visibility: "public"
      },
      {
        input: "\"(]\"",
        output: "false",
        visibility: "public"
      },
      {
        input: "\"{[]}\"",
        output: "true",
        visibility: "hidden"
      }
    ],
    boilerPlate: [
      {
        language: "javascript",
        code: "function isValid(s) {\n  // Write your code here\n}",
        description: "Valid Parentheses boilerplate code in JavaScript"
      }
    ]
  },
  {
    name: "Single Number",
    description: "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.",
    difficulty: "medium",
    category: ["Array", "Bit Manipulation"],
    constraints: [
      "1 <= nums.length <= 3 * 10^4",
      "-3 * 10^4 <= nums[i] <= 3 * 10^4",
      "Each element in the array appears twice except for one element which appears only once."
    ],
    examples: [
      {
        input: "nums = [2,2,1]",
        output: "1"
      }
    ],
    testCases: [
      {
        input: "[2,2,1]",
        output: "1",
        visibility: "public"
      },
      {
        input: "[4,1,2,1,2]",
        output: "4",
        visibility: "public"
      }
    ],
    boilerPlate: [
      {
        language: "javascript",
        code: "function singleNumber(nums) {\n  // Write your code here\n}",
        description: "Single Number boilerplate code in JavaScript"
      }
    ]
  },
  {
    name: "Container With Most Water",
    description: "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`-th line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
    difficulty: "medium",
    category: ["Array", "Two Pointers"],
    constraints: [
      "n == height.length",
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4"
    ],
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49"
      }
    ],
    testCases: [
      {
        input: "[1,8,6,2,5,4,8,3,7]",
        output: "49",
        visibility: "public"
      },
      {
        input: "[1,1]",
        output: "1",
        visibility: "public"
      }
    ],
    boilerPlate: [
      {
        language: "javascript",
        code: "function maxArea(height) {\n  // Write your code here\n}",
        description: "Container With Most Water boilerplate code in JavaScript"
      }
    ]
  },
  {
    name: "Median of Two Sorted Arrays",
    description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.",
    difficulty: "hard",
    category: ["Array", "Binary Search", "Divide and Conquer"],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000"
    ],
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000"
      }
    ],
    testCases: [
      {
        input: "[1,3]\n[2]",
        output: "2.00000",
        visibility: "public"
      },
      {
        input: "[1,2]\n[3,4]",
        output: "2.50000",
        visibility: "public"
      }
    ],
    boilerPlate: [
      {
        language: "javascript",
        code: "function findMedianSortedArrays(nums1, nums2) {\n  // Write your code here\n}",
        description: "Median of Two Sorted Arrays boilerplate code in JavaScript"
      }
    ]
  }
];

const seedQuestions = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environmental variables");
    }

    console.log("Connecting to database for seeding...");
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully.");

    console.log("Clearing existing questions...");
    await Question.deleteMany({});
    console.log("Existing questions cleared.");

    console.log("Seeding questions...");
    const result = await Question.insertMany(questions);
    console.log(`Successfully seeded ${result.length} questions!`);
  } catch (error) {
    console.error("Error during seeding process:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
    process.exit(0);
  }
};

seedQuestions();
