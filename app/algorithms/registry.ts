import type { Algorithm, Category } from './types'
import RedundantConnectionViz from './algos/redundant-connection/RedundantConnectionViz'
import TwoSumViz from './algos/two-sum/TwoSumViz'
import GroupAnagramsViz from './algos/group-anagrams/GroupAnagramsViz'
import ValidParenthesesViz from './algos/valid-parentheses/ValidParenthesesViz'

export const CATEGORIES: Category[] = [
  {
    slug: 'union-find',
    name: 'Union–Find',
    blurb: 'Disjoint-set structures: connectivity, cycles, and grouping.',
  },
  {
    slug: 'arrays-hashing',
    name: 'Arrays & Hashing',
    blurb: 'Lookups, frequency maps, and the bread-and-butter of interviews.',
  },
  {
    slug: 'stack',
    name: 'Stack',
    blurb: 'LIFO problems: bracket matching, spans, and nearest-element queries.',
  },
  {
    slug: 'graphs',
    name: 'Graphs',
    blurb: 'Traversal, flood fill, and exploring connected components.',
  },
  {
    slug: 'dynamic-programming',
    name: 'Dynamic Programming',
    blurb: 'Overlapping subproblems solved once and reused.',
  },
]

export const ALGORITHMS: Algorithm[] = [
  {
    slug: 'redundant-connection',
    category: 'union-find',
    title: 'Redundant Connection',
    difficulty: 'Medium',
    blurb: 'Find the edge that closes a cycle in a tree-plus-one-edge graph.',
    tags: ['LeetCode 684', 'Union–Find', 'Cycle'],
    statement:
      'You are given a graph that started as a tree with n nodes (labelled 1..n) and had exactly one extra edge added. The result has one cycle. Return the edge that can be removed so the graph is a tree again. If there are several answers, return the one that appears last in the input.',
    intuition: [
      'A tree with n nodes has exactly n−1 edges and no cycles. Adding one more edge creates exactly one cycle.',
      'Process edges in order and keep a Union–Find (disjoint-set) of which nodes are already connected.',
      'For each edge (u, v): if u and v already share a root, this edge connects two nodes that were reachable from one another — it closes the cycle and is the redundant one.',
      'Otherwise the edge joins two separate components, so union them and keep going.',
    ],
    steps: [
      'Initialise parent[x] = x for every node (each node is its own root).',
      'find(x): follow parent pointers up until you reach a root (parent[x] == x).',
      'For each edge (u, v) compute ru = find(u) and rv = find(v).',
      'If ru == rv the two ends are already connected → return [u, v].',
      'Else set parent[ru] = rv to merge the two trees and continue.',
    ],
    complexity: {
      time: 'O(n · α(n)) — near-linear; α is the inverse Ackermann function.',
      space: 'O(n) for the parent array.',
    },
    Visualizer: RedundantConnectionViz,
    code: {
      py: `def findRedundantConnection(edges):
    parent = list(range(len(edges) + 1))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return [u, v]    # redundant
        parent[ru] = rv      # union
    return []
`,
      js: `function findRedundantConnection(edges) {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);

  const find = (x) => {
    while (parent[x] !== x) x = parent[x];
    return x;
  };

  for (const [u, v] of edges) {
    const ru = find(u), rv = find(v);
    if (ru === rv) return [u, v]; // redundant
    parent[ru] = rv;              // union
  }
  return [];
}
`,
      ts: `function findRedundantConnection(edges: number[][]): number[] {
  const parent: number[] = Array.from(
    { length: edges.length + 1 },
    (_, i) => i,
  );

  const find = (x: number): number => {
    while (parent[x] !== x) x = parent[x];
    return x;
  };

  for (const [u, v] of edges) {
    const ru = find(u), rv = find(v);
    if (ru === rv) return [u, v]; // redundant
    parent[ru] = rv;              // union
  }
  return [];
}
`,
      java: `class Solution {
    private int[] parent;

    public int[] findRedundantConnection(int[][] edges) {
        parent = new int[edges.length + 1];
        for (int i = 0; i < parent.length; i++) parent[i] = i;

        for (int[] e : edges) {
            int ru = find(e[0]), rv = find(e[1]);
            if (ru == rv) return e;   // redundant
            parent[ru] = rv;          // union
        }
        return new int[0];
    }

    private int find(int x) {
        while (parent[x] != x) x = parent[x];
        return x;
    }
}
`,
      cpp: `class Solution {
public:
    vector<int> parent;

    int find(int x) {
        while (parent[x] != x) x = parent[x];
        return x;
    }

    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        parent.resize(edges.size() + 1);
        for (int i = 0; i < (int)parent.size(); i++) parent[i] = i;

        for (auto& e : edges) {
            int ru = find(e[0]), rv = find(e[1]);
            if (ru == rv) return e;   // redundant
            parent[ru] = rv;          // union
        }
        return {};
    }
};
`,
    },
  },

  {
    slug: 'two-sum',
    category: 'arrays-hashing',
    title: 'Two Sum',
    difficulty: 'Easy',
    blurb: 'Return indices of the two numbers that add up to a target.',
    tags: ['LeetCode 1', 'Hash Map'],
    statement:
      'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. Each input has exactly one solution and you may not use the same element twice.',
    intuition: [
      'The brute-force scan of every pair is O(n²). We can do better by remembering what we have already seen.',
      'As we walk the array, for the current value n the partner we need is target − n.',
      'A hash map from value → index lets us check in O(1) whether that partner appeared earlier.',
    ],
    steps: [
      'Create an empty map of value → index.',
      'For each element n at index i, compute need = target − n.',
      'If need is already in the map, return [map[need], i].',
      'Otherwise store map[n] = i and continue.',
    ],
    complexity: {
      time: 'O(n) — one pass over the array.',
      space: 'O(n) for the hash map.',
    },
    Visualizer: TwoSumViz,
    code: {
      py: `def twoSum(nums, target):
    seen = {}  # value -> index
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []
`,
      js: `function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
`,
      ts: `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return [];
}
`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>(); // value -> index
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) return new int[]{seen.get(need), i};
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}
`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen; // value -> index
        for (int i = 0; i < (int)nums.size(); i++) {
            int need = target - nums[i];
            if (seen.count(need)) return {seen[need], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};
`,
    },
  },

  {
    slug: 'group-anagrams',
    category: 'arrays-hashing',
    title: 'Group Anagrams',
    difficulty: 'Medium',
    blurb: 'Cluster words that are rearrangements of the same letters.',
    tags: ['LeetCode 49', 'Hash Map', 'Sorting'],
    statement:
      'Given an array of strings strs, group the anagrams together. Two words are anagrams if one can be formed by rearranging the letters of the other. Return the groups in any order.',
    intuition: [
      'Anagrams are exactly the words that contain the same letters with the same counts — they only differ in order.',
      'So we need a fingerprint that is identical for anagrams and different otherwise.',
      'Sorting a word’s letters gives such a fingerprint: "eat", "tea", and "ate" all sort to "aet".',
      'Use that sorted string as a hash-map key and append each word to its bucket.',
    ],
    steps: [
      'Create an empty map from key → list of words.',
      'For each word, sort its characters to build the key.',
      'If the key has no bucket yet, create an empty one.',
      'Append the word to its bucket.',
      'Return all the buckets (the map’s values).',
    ],
    complexity: {
      time: 'O(n · k log k) — n words, each of length up to k, sorted once.',
      space: 'O(n · k) to store every word in the map.',
    },
    Visualizer: GroupAnagramsViz,
    code: {
      py: `def groupAnagrams(strs):
    groups = {}  # sorted key -> list of words
    for word in strs:
        key = ''.join(sorted(word))
        groups.setdefault(key, []).append(word)
    return list(groups.values())
`,
      js: `function groupAnagrams(strs) {
  const groups = new Map(); // sorted key -> list of words
  for (const word of strs) {
    const key = word.split('').sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}
`,
      ts: `function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>(); // sorted key -> words
  for (const word of strs) {
    const key = word.split('').sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(word);
  }
  return [...groups.values()];
}
`,
      java: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String word : strs) {
            char[] chars = word.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(word);
        }
        return new ArrayList<>(groups.values());
    }
}
`,
      cpp: `class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (const string& word : strs) {
            string key = word;
            sort(key.begin(), key.end());
            groups[key].push_back(word);
        }
        vector<vector<string>> result;
        for (auto& [key, group] : groups) result.push_back(group);
        return result;
    }
};
`,
    },
  },

  {
    slug: 'valid-parentheses',
    category: 'stack',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    blurb: 'Decide whether every bracket is correctly opened and closed.',
    tags: ['LeetCode 20', 'Stack'],
    statement:
      "Given a string s containing only the characters '(', ')', '{', '}', '[' and ']', determine if the input is valid. Brackets must be closed by the same type and in the correct order, so every closing bracket matches the most recently opened one.",
    intuition: [
      'The most recently opened bracket must be the first one closed — that “last in, first out” rule is exactly a stack.',
      'Push every opening bracket. When a closing bracket arrives, the top of the stack must be its matching opener.',
      'If the top does not match (or the stack is empty), the string is invalid.',
      'After scanning everything, a valid string leaves the stack empty — nothing was left unclosed.',
    ],
    steps: [
      'Create an empty stack and a map from each closing bracket to its opener.',
      'For each character: if it is a closing bracket, pop the stack and check it equals the expected opener — otherwise return false.',
      'If it is an opening bracket, push it.',
      'At the end, return true only if the stack is empty.',
    ],
    complexity: {
      time: 'O(n) — each character is pushed/popped at most once.',
      space: 'O(n) for the stack in the worst case (all opening brackets).',
    },
    Visualizer: ValidParenthesesViz,
    code: {
      py: `def isValid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack
`,
      js: `function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}
`,
      ts: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}
`,
      java: `class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
        for (char ch : s.toCharArray()) {
            if (pairs.containsKey(ch)) {
                if (stack.isEmpty() || stack.pop() != pairs.get(ch)) return false;
            } else {
                stack.push(ch);
            }
        }
        return stack.isEmpty();
    }
}
`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> pairs{{')', '('}, {']', '['}, {'}', '{'}};
        for (char ch : s) {
            if (pairs.count(ch)) {
                if (st.empty() || st.top() != pairs[ch]) return false;
                st.pop();
            } else {
                st.push(ch);
            }
        }
        return st.empty();
    }
};
`,
    },
  },

  {
    slug: 'number-of-islands',
    category: 'graphs',
    title: 'Number of Islands',
    difficulty: 'Medium',
    blurb: 'Count connected components of land in a 2-D grid.',
    tags: ['LeetCode 200', 'Flood Fill', 'DFS'],
    statement:
      "Given an m × n grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent land cells horizontally or vertically.",
    intuition: [
      'Each island is a connected component of land cells. Counting islands = counting components.',
      'Scan the grid; the first time you hit an unvisited land cell, you have found a new island.',
      'Flood-fill (DFS) from that cell, sinking every connected land cell to water so it is not counted again.',
    ],
    steps: [
      'Walk every cell (r, c) of the grid.',
      "When you find a '1', increment the island count.",
      'Run a DFS that sinks the cell and recurses into its four neighbours.',
      'The sink marks land as water, so each island is counted exactly once.',
    ],
    complexity: {
      time: 'O(m · n) — every cell is visited a constant number of times.',
      space: 'O(m · n) worst case for the recursion stack.',
    },
    code: {
      py: `def numIslands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def sink(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0'  # mark visited
        sink(r + 1, c)
        sink(r - 1, c)
        sink(r, c + 1)
        sink(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                sink(r, c)
    return count
`,
      js: `function numIslands(grid) {
  if (!grid.length) return 0;
  const rows = grid.length, cols = grid[0].length;
  let count = 0;

  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // mark visited
    sink(r + 1, c);
    sink(r - 1, c);
    sink(r, c + 1);
    sink(r, c - 1);
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        sink(r, c);
      }
    }
  }
  return count;
}
`,
      ts: `function numIslands(grid: string[][]): number {
  if (!grid.length) return 0;
  const rows = grid.length, cols = grid[0].length;
  let count = 0;

  const sink = (r: number, c: number): void => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // mark visited
    sink(r + 1, c);
    sink(r - 1, c);
    sink(r, c + 1);
    sink(r, c - 1);
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        sink(r, c);
      }
    }
  }
  return count;
}
`,
      java: `class Solution {
    private char[][] grid;
    private int rows, cols;

    public int numIslands(char[][] grid) {
        if (grid.length == 0) return 0;
        this.grid = grid;
        this.rows = grid.length;
        this.cols = grid[0].length;
        int count = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    sink(r, c);
                }
            }
        }
        return count;
    }

    private void sink(int r, int c) {
        if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] != '1') return;
        grid[r][c] = '0'; // mark visited
        sink(r + 1, c);
        sink(r - 1, c);
        sink(r, c + 1);
        sink(r, c - 1);
    }
}
`,
      cpp: `class Solution {
public:
    int rows, cols;

    void sink(vector<vector<char>>& grid, int r, int c) {
        if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] != '1') return;
        grid[r][c] = '0'; // mark visited
        sink(grid, r + 1, c);
        sink(grid, r - 1, c);
        sink(grid, r, c + 1);
        sink(grid, r, c - 1);
    }

    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty()) return 0;
        rows = grid.size();
        cols = grid[0].size();
        int count = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    sink(grid, r, c);
                }
            }
        }
        return count;
    }
};
`,
    },
  },

  {
    slug: 'climbing-stairs',
    category: 'dynamic-programming',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    blurb: 'Count the ways to climb n stairs taking 1 or 2 steps at a time.',
    tags: ['LeetCode 70', 'Fibonacci'],
    statement:
      'You are climbing a staircase that takes n steps to reach the top. Each time you can climb either 1 or 2 steps. In how many distinct ways can you climb to the top?',
    intuition: [
      'To reach step i your last move was either a 1-step (from i−1) or a 2-step (from i−2).',
      'So ways(i) = ways(i−1) + ways(i−2) — the Fibonacci recurrence.',
      'Only the previous two values are ever needed, so we can keep two rolling variables instead of a full array.',
    ],
    steps: [
      'Base cases: there is 1 way to stand at the bottom and 1 way to reach the first step.',
      'Keep a = ways(i−2) and b = ways(i−1).',
      'Each iteration advance the window: (a, b) → (b, a + b).',
      'After n iterations a holds ways(n).',
    ],
    complexity: {
      time: 'O(n) — a single loop.',
      space: 'O(1) — two rolling variables.',
    },
    code: {
      py: `def climbStairs(n):
    a, b = 1, 1  # ways to reach steps i-2 and i-1
    for _ in range(n):
        a, b = b, a + b
    return a
`,
      js: `function climbStairs(n) {
  let a = 1, b = 1; // ways to reach steps i-2 and i-1
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}
`,
      ts: `function climbStairs(n: number): number {
  let a = 1, b = 1; // ways to reach steps i-2 and i-1
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}
`,
      java: `class Solution {
    public int climbStairs(int n) {
        int a = 1, b = 1; // ways to reach steps i-2 and i-1
        for (int i = 0; i < n; i++) {
            int next = a + b;
            a = b;
            b = next;
        }
        return a;
    }
}
`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        int a = 1, b = 1; // ways to reach steps i-2 and i-1
        for (int i = 0; i < n; i++) {
            int next = a + b;
            a = b;
            b = next;
        }
        return a;
    }
};
`,
    },
  },
]

// ── Lookups ───────────────────────────────────────────────
export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function getAlgorithmsByCategory(categorySlug: string): Algorithm[] {
  return ALGORITHMS.filter((a) => a.category === categorySlug)
}

export function getAlgorithm(categorySlug: string, algoSlug: string): Algorithm | undefined {
  return ALGORITHMS.find((a) => a.category === categorySlug && a.slug === algoSlug)
}
