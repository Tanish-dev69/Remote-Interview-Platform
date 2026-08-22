export const PROBLEMS = {
  "two-sum": {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array • Hash Table",
    description: {
      text: "Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target.",
      notes: ["You may assume that each input would have exactly one solution."],
    },
    examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }],
    constraints: ["2 ≤ nums.length ≤ 10⁴", "Only one valid answer exists"],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Write solution here\n}`,
      python: `def twoSum(nums, target):\n    # Write solution here\n    pass`,
      java: `import java.util.*;\n\nclass Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        return new int[0];\n    }\n}`
    },
    testRunner: {
      javascript: `\nconst tests = [{n:[2,7,11,15],t:9,e:"0,1"},{n:[3,2,4],t:6,e:"1,2"}];\ntests.forEach((t,i)=>{const r=twoSum(t.n,t.t).sort((a,b)=>a-b).join(",");console.log(\`CASE_\${i}:\${r===t.e?"PASS":"FAIL"}\`)});`,
      python: `\ntests=[{"n":[2,7,11,15],"t":9,"e":[0,1]},{"n":[3,2,4],"t":6,"e":[1,2]}]\nfor i,t in enumerate(tests):\n    r=sorted(twoSum(t["n"],t["t"]))\n    print(f"CASE_{i}:{'PASS' if r==t['e'] else 'FAIL'}")`,
      java: `\npublic class Main {\n  public static void main(String[] args) {\n    int[][] n={{2,7,11,15},{3,2,4}}; int[] t={9,6}; String[] e={"[0, 1]","[1, 2]"};\n    for(int i=0;i<n.length;i++){int[] r=Solution.twoSum(n[i],t[i]);java.util.Arrays.sort(r);System.out.println("CASE_"+i+":"+(java.util.Arrays.toString(r).equals(e[i])?"PASS":"FAIL"));}\n  }\n}`
    }
  },

  "reverse-string": {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    category: "String",
    description: { text: "Reverse the input array of characters in-place.", notes: ["O(1) extra memory."] },
    examples: [{ input: 's = ["h","e"]', output: '["e","h"]' }],
    constraints: ["1 ≤ s.length ≤ 10⁵"],
    starterCode: {
      javascript: `function reverseString(s) {\n  // Write solution here\n}`,
      python: `def reverseString(s):\n    # Write solution here\n    pass`,
      java: `import java.util.*;\n\nclass Solution {\n    public static void reverseString(char[] s) {\n    }\n}`
    },
    testRunner: {
      javascript: `\nconst tests=[{i:["h","e","l","l","o"],e:"o,l,l,e,h"},{i:["H","a","n"],e:"n,a,H"}];\ntests.forEach((t,idx)=>{reverseString(t.i);console.log(\`CASE_\${idx}:\${t.i.join(",")===t.e?"PASS":"FAIL"}\`)});`,
      python: `\ntests=[{"i":["h","e","l","l","o"],"e":["o","l","l","e","h"]},{"i":["H","a","n"],"e":["n","a","H"]}];\nfor i,t in enumerate(tests):\n    reverseString(t["i"])\n    print(f"CASE_{i}:{'PASS' if t['i']==t['e'] else 'FAIL'}")`,
      java: `\npublic class Main {\n  public static void main(String[] args) {\n    char[][] s={{'h','e','l','l','o'},{'H','a','n'}};\n    String[] e={"[o, l, l, e, h]","[n, a, H]"};\n    for(int i=0;i<s.length;i++){Solution.reverseString(s[i]);System.out.println("CASE_"+i+":"+(java.util.Arrays.toString(s[i]).equals(e[i])?"PASS":"FAIL"));}\n  }\n}`
    }
  },

  "valid-palindrome": {
    id: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    category: "String",
    description: { text: "Return true if the string is a palindrome after cleaning.", notes: [] },
    examples: [{ input: 's = "race a car"', output: "false" }],
    constraints: ["1 ≤ s.length ≤ 2 * 10⁵"],
    starterCode: {
      javascript: `function isPalindrome(s) {\n  return false;\n}`,
      python: `def isPalindrome(s):\n    return False`,
      java: `class Solution {\n    public static boolean isPalindrome(String s) {\n        return false;\n    }\n}`
    },
    testRunner: {
      javascript: `\nconsole.log("CASE_0:"+(isPalindrome("A man, a plan, a canal: Panama")===true?"PASS":"FAIL"));\nconsole.log("CASE_1:"+(isPalindrome("race a car")===false?"PASS":"FAIL"));`,
      python: `\nprint(f"CASE_0:{'PASS' if isPalindrome('A man, a plan, a canal: Panama')==True else 'FAIL'}")\nprint(f"CASE_1:{'PASS' if isPalindrome('race a car')==False else 'FAIL'}")`,
      java: `\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("CASE_0:"+(Solution.isPalindrome("A man, a plan, a canal: Panama")?"PASS":"FAIL"));\n    System.out.println("CASE_1:"+(Solution.isPalindrome("race a car")==false?"PASS":"FAIL"));\n  }\n}`
    }
  },

  "maximum-subarray": {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Array",
    description: { text: "Find the subarray with the largest sum.", notes: [] },
    examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6" }],
    constraints: ["1 ≤ nums.length ≤ 10⁵"],
    starterCode: {
      javascript: `function maxSubArray(nums) {\n  return 0;\n}`,
      python: `def maxSubArray(nums):\n    return 0`,
      java: `class Solution {\n    public static int maxSubArray(int[] nums) {\n        return 0;\n    }\n}`
    },
    testRunner: {
      javascript: `\nconsole.log("CASE_0:"+(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])===6?"PASS":"FAIL"));\nconsole.log("CASE_1:"+(maxSubArray([1])===1?"PASS":"FAIL"));`,
      python: `\nprint(f"CASE_0:{'PASS' if maxSubArray([-2,1,-3,4,-1,2,1,-5,4])==6 else 'FAIL'}")\nprint(f"CASE_1:{'PASS' if maxSubArray([1])==1 else 'FAIL'}")`,
      java: `\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("CASE_0:"+(Solution.maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4})==6?"PASS":"FAIL"));\n    System.out.println("CASE_1:"+(Solution.maxSubArray(new int[]{1})==1?"PASS":"FAIL"));\n  }\n}`
    }
  },

  "contains-duplicate": {
    id: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    category: "Array",
    description: { text: "Return true if any value appears at least twice.", notes: [] },
    examples: [{ input: "nums = [1,2,3,1]", output: "true" }],
    starterCode: {
      javascript: `function containsDuplicate(nums) {\n  return false;\n}`,
      python: `def containsDuplicate(nums):\n    return False`,
      java: `class Solution {\n    public static boolean containsDuplicate(int[] nums) {\n        return false;\n    }\n}`
    },
    testRunner: {
      javascript: `\nconsole.log("CASE_0:"+(containsDuplicate([1,2,3,1])===true?"PASS":"FAIL"));\nconsole.log("CASE_1:"+(containsDuplicate([1,2,3,4])===false?"PASS":"FAIL"));`,
      python: `\nprint(f"CASE_0:{'PASS' if containsDuplicate([1,2,3,1])==True else 'FAIL'}")\nprint(f"CASE_1:{'PASS' if containsDuplicate([1,2,3,4])==False else 'FAIL'}")`,
      java: `\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("CASE_0:"+(Solution.containsDuplicate(new int[]{1,2,3,1})?"PASS":"FAIL"));\n    System.out.println("CASE_1:"+(Solution.containsDuplicate(new int[]{1,2,3,4})==false?"PASS":"FAIL"));\n  }\n}`
    }
  },

  "climbing-stairs": {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    description: { text: "Find distinct ways to reach the top (n steps).", notes: [] },
    examples: [{ input: "n = 3", output: "3" }],
    starterCode: {
      javascript: `function climbStairs(n) {\n  return 0;\n}`,
      python: `def climbStairs(n):\n    return 0`,
      java: `class Solution {\n    public static int climbStairs(int n) {\n        return 0;\n    }\n}`
    },
    testRunner: {
      javascript: `\nconsole.log("CASE_0:"+(climbStairs(2)===2?"PASS":"FAIL"));\nconsole.log("CASE_1:"+(climbStairs(3)===3?"PASS":"FAIL"));`,
      python: `\nprint(f"CASE_0:{'PASS' if climbStairs(2)==2 else 'FAIL'}")\nprint(f"CASE_1:{'PASS' if climbStairs(3)==3 else 'FAIL'}")`,
      java: `\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("CASE_0:"+(Solution.climbStairs(2)==2?"PASS":"FAIL"));\n    System.out.println("CASE_1:"+(Solution.climbStairs(3)==3?"PASS":"FAIL"));\n  }\n}`
    }
  }
};

export const LANGUAGE_CONFIG = {
  javascript: { name: "JavaScript", icon: "/javascript.png", monacoLang: "javascript" },
  python: { name: "Python", icon: "/python.png", monacoLang: "python" },
  java: { name: "Java", icon: "/java.png", monacoLang: "java" }
};