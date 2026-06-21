import type { Algorithm, Category, Lang } from './types'
import RedundantConnectionViz from './algos/redundant-connection/RedundantConnectionViz'
import TwoSumViz from './algos/two-sum/TwoSumViz'
import GroupAnagramsViz from './algos/group-anagrams/GroupAnagramsViz'
import ValidParenthesesViz from './algos/valid-parentheses/ValidParenthesesViz'
import NumberOfIslandsViz from './algos/number-of-islands/NumberOfIslandsViz'
import BinaryTreeLevelOrderViz from './algos/binary-tree-level-order/BinaryTreeLevelOrderViz'
import LowestCommonAncestorViz from './algos/lowest-common-ancestor/LowestCommonAncestorViz'
import TopKFrequentViz from './algos/top-k-frequent/TopKFrequentViz'
import MergeIntervalsViz from './algos/merge-intervals/MergeIntervalsViz'
import CourseScheduleViz from './algos/course-schedule/CourseScheduleViz'

// Lowest Common Ancestor has two notable solutions, shared below.
const LCA_RECURSIVE: Record<Lang, string> = {
  py: `def lowestCommonAncestor(root, p, q):
    if not root or root is p or root is q:
        return root
    left = lowestCommonAncestor(root.left, p, q)
    right = lowestCommonAncestor(root.right, p, q)
    if left and right:
        return root
    return left or right
`,
  js: `function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left || right;
}
`,
  ts: `function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode,
  q: TreeNode,
): TreeNode | null {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left ?? right;
}
`,
  java: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root;
        return left != null ? left : right;
    }
}
`,
  cpp: `class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (!root || root == p || root == q) return root;
        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);
        if (left && right) return root;
        return left ? left : right;
    }
};
`,
}

// Iterative solution that exploits the BST ordering (LeetCode 235).
const LCA_BST: Record<Lang, string> = {
  py: `def lowestCommonAncestor(root, p, q):
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root
`,
  js: `function lowestCommonAncestor(root, p, q) {
  while (root) {
    if (p.val < root.val && q.val < root.val) {
      root = root.left;
    } else if (p.val > root.val && q.val > root.val) {
      root = root.right;
    } else {
      return root;
    }
  }
}
`,
  ts: `function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode,
  q: TreeNode,
): TreeNode | null {
  while (root) {
    if (p.val < root.val && q.val < root.val) {
      root = root.left;
    } else if (p.val > root.val && q.val > root.val) {
      root = root.right;
    } else {
      return root;
    }
  }
  return null;
}
`,
  java: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        while (root != null) {
            if (p.val < root.val && q.val < root.val) {
                root = root.left;
            } else if (p.val > root.val && q.val > root.val) {
                root = root.right;
            } else {
                return root;
            }
        }
        return null;
    }
}
`,
  cpp: `class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        while (root) {
            if (p->val < root->val && q->val < root->val) {
                root = root->left;
            } else if (p->val > root->val && q->val > root->val) {
                root = root->right;
            } else {
                return root;
            }
        }
        return nullptr;
    }
};
`,
}

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
    slug: 'intervals',
    name: 'Intervals',
    blurb: 'Sort and sweep over ranges: merging, scheduling, and overlaps.',
  },
  {
    slug: 'trees',
    name: 'Trees',
    blurb: 'Hierarchical data: depth-first and breadth-first traversals.',
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
    slug: 'top-k-frequent',
    category: 'arrays-hashing',
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    blurb: 'Return the k values that appear most often — in O(n) with bucket sort.',
    tags: ['LeetCode 347', 'Hash Map', 'Bucket Sort'],
    statement:
      'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.',
    intuition: [
      'First tally how many times each value occurs using a hash map.',
      'The highest frequency any value can have is the array length, so make one bucket per possible frequency.',
      'Drop each value into the bucket matching its count — this groups by frequency without sorting (no n·log n).',
      'Walk the buckets from the highest frequency downward, collecting values until you have k.',
    ],
    steps: [
      'Count occurrences of each value in a map.',
      'Create buckets indexed by frequency (0..n).',
      'Place each value in the bucket equal to its count.',
      'Scan buckets high → low, collecting values until k are gathered.',
    ],
    complexity: {
      time: 'O(n) — counting, bucketing, and scanning are each linear.',
      space: 'O(n) for the count map and the buckets.',
    },
    Visualizer: TopKFrequentViz,
    code: {
      py: `def topKFrequent(nums, k):
    count = {}
    for n in nums:
        count[n] = count.get(n, 0) + 1
    buckets = [[] for _ in range(len(nums) + 1)]
    for n, c in count.items():
        buckets[c].append(n)
    res = []
    for c in range(len(buckets) - 1, 0, -1):
        for n in buckets[c]:
            res.append(n)
            if len(res) == k:
                return res
    return res
`,
      js: `function topKFrequent(nums, k) {
  const count = new Map();
  for (const n of nums) count.set(n, (count.get(n) || 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [n, c] of count) buckets[c].push(n);
  const res = [];
  for (let c = buckets.length - 1; c > 0 && res.length < k; c--) {
    for (const n of buckets[c]) {
      res.push(n);
      if (res.length === k) return res;
    }
  }
  return res;
}
`,
      ts: `function topKFrequent(nums: number[], k: number): number[] {
  const count = new Map<number, number>();
  for (const n of nums) count.set(n, (count.get(n) || 0) + 1);
  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);
  for (const [n, c] of count) buckets[c].push(n);
  const res: number[] = [];
  for (let c = buckets.length - 1; c > 0 && res.length < k; c--) {
    for (const n of buckets[c]) {
      res.push(n);
      if (res.length === k) return res;
    }
  }
  return res;
}
`,
      java: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int n : nums) count.merge(n, 1, Integer::sum);
        List<Integer>[] buckets = new List[nums.length + 1];
        for (int i = 0; i < buckets.length; i++) buckets[i] = new ArrayList<>();
        for (var e : count.entrySet()) buckets[e.getValue()].add(e.getKey());
        int[] res = new int[k];
        int idx = 0;
        for (int c = buckets.length - 1; c > 0 && idx < k; c--)
            for (int n : buckets[c]) {
                res[idx++] = n;
                if (idx == k) return res;
            }
        return res;
    }
}
`,
      cpp: `class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int n : nums) count[n]++;
        vector<vector<int>> buckets(nums.size() + 1);
        for (auto& [n, c] : count) buckets[c].push_back(n);
        vector<int> res;
        for (int c = buckets.size() - 1; c > 0 && (int)res.size() < k; c--)
            for (int n : buckets[c]) {
                res.push_back(n);
                if ((int)res.size() == k) return res;
            }
        return res;
    }
};
`,
    },
  },

  {
    slug: 'binary-tree-level-order',
    category: 'trees',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    blurb: 'Return node values grouped level by level, top to bottom.',
    tags: ['LeetCode 102', 'BFS', 'Queue'],
    statement:
      "Given the root of a binary tree, return the level-order traversal of its nodes' values — the values grouped by depth, read left to right, from the top level down.",
    intuition: [
      'Level order is a breadth-first walk: finish every node at depth 0 before touching depth 1, and so on.',
      'A queue produces that order for free — it always hands back the oldest-enqueued node first (FIFO).',
      'The trick to grouping by level is to record the queue’s size at the start of each round; exactly that many nodes make up the current level.',
      'Dequeue that many nodes, collect their values, and enqueue their children for the next round.',
    ],
    steps: [
      'If the tree is empty, return an empty list.',
      'Put the root in a queue.',
      'While the queue is non-empty, snapshot its length — that many nodes form the current level.',
      'Dequeue each one, append its value to the level, and enqueue its non-null children.',
      'Push the finished level onto the result and repeat.',
    ],
    complexity: {
      time: 'O(n) — every node is enqueued and dequeued exactly once.',
      space: 'O(n) — the queue holds up to the widest level of the tree.',
    },
    Visualizer: BinaryTreeLevelOrderViz,
    code: {
      py: `from collections import deque

def levelOrder(root):
    result = []
    if not root:
        return result
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result
`,
      js: `function levelOrder(root) {
  const result = [];
  if (!root) return result;
  const queue = [root];
  while (queue.length) {
    const level = [];
    for (let n = queue.length; n > 0; n--) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
`,
      ts: `function levelOrder(root: TreeNode | null): number[][] {
  const result: number[][] = [];
  if (!root) return result;
  const queue: TreeNode[] = [root];
  while (queue.length) {
    const level: number[] = [];
    for (let n = queue.length; n > 0; n--) {
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
`,
      java: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();
            for (int n = 0; n < size; n++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(level);
        }
        return result;
    }
}
`,
      cpp: `class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> result;
        if (!root) return result;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int size = q.size();
            vector<int> level;
            for (int n = 0; n < size; n++) {
                TreeNode* node = q.front(); q.pop();
                level.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            result.push_back(level);
        }
        return result;
    }
};
`,
    },
  },

  {
    slug: 'lowest-common-ancestor',
    category: 'trees',
    title: 'Lowest Common Ancestor of a Binary Tree',
    difficulty: 'Medium',
    blurb: 'Find the deepest node that has both target nodes as descendants.',
    tags: ['LeetCode 236', 'DFS', 'Recursion'],
    statement:
      'Given the root of a binary tree and two nodes p and q, return their lowest common ancestor (LCA): the deepest node that has both p and q as descendants. A node may be a descendant of itself.',
    intuition: [
      'Solve it bottom-up: ask each node “does my subtree contain p or q?”',
      'A call returns a non-null signal if a target is found at or below that node.',
      'If a node hears back from BOTH its left and right subtrees, the two targets first meet here — this node is the LCA.',
      'If only one side reports a target, pass that signal straight up; the meeting point is higher.',
    ],
    steps: [
      'If the node is null or is one of the targets, return it.',
      'Recurse into the left and right children.',
      'If both recursive calls return non-null, the current node is the LCA.',
      'Otherwise return whichever side was non-null (or null if neither).',
    ],
    complexity: {
      time: 'O(n) — each node is visited once.',
      space: 'O(h) for the recursion stack, where h is the tree height.',
    },
    Visualizer: LowestCommonAncestorViz,
    code: LCA_RECURSIVE,
    solutions: [
      {
        name: '1 · Recursive — works on any binary tree',
        blurb:
          'Bottom-up DFS: each call reports whether a target is in its subtree; the node that hears back from both sides is the LCA.',
        code: LCA_RECURSIVE,
      },
      {
        name: '2 · Iterative — binary search tree only',
        blurb:
          'When the tree is a BST, the ordering tells you which way to walk. Where the paths to p and q diverge is the LCA — O(h) time, O(1) space.',
        code: LCA_BST,
      },
    ],
  },

  {
    slug: 'merge-intervals',
    category: 'intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    blurb: 'Combine every group of overlapping ranges into single intervals.',
    tags: ['LeetCode 56', 'Sorting', 'Greedy'],
    statement:
      'Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals and return the non-overlapping intervals that cover all the input ranges.',
    intuition: [
      'Picture each interval as a bar on a number line. Two bars overlap when one starts before the other ends — and merging them just means taking one bar from the earliest start to the latest end.',
      'The key trick is to sort by start first. Once sorted, any intervals that overlap are guaranteed to be neighbours, so you never have to look backwards — you only compare each interval with the single "current" interval you are building.',
      'Walk through the sorted list keeping one running interval, cur. For the next interval: if it starts at or before cur.end, it overlaps, so absorb it by pushing cur.end out to the larger of the two ends.',
      'If it starts after cur.end, there is a gap — cur is finished and can never grow again, so save it and let the next interval become the new cur.',
      'Why max(cur.end, next.end)? Because next might be completely inside cur (e.g. [1,10] then [2,3]); taking the max keeps the longer reach instead of shrinking it.',
    ],
    steps: [
      'Sort the intervals by their start value.',
      'Set cur = the first interval.',
      'For each remaining interval next: if next.start ≤ cur.end, they overlap → set cur.end = max(cur.end, next.end).',
      'Otherwise there is a gap → push cur to the result, then set cur = next.',
      'After the loop, push the final cur. That list is the answer.',
    ],
    complexity: {
      time: 'O(n log n) — the sort dominates; the single sweep afterwards is O(n).',
      space: 'O(n) for the output list (O(log n)–O(n) for the sort itself).',
    },
    Visualizer: MergeIntervalsViz,
    code: {
      py: `def merge(intervals):
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    res = []
    cur = intervals[0]
    for nxt in intervals[1:]:
        if nxt[0] <= cur[1]:          # overlap
            cur[1] = max(cur[1], nxt[1])
        else:                          # gap
            res.append(cur)
            cur = nxt
    res.append(cur)
    return res
`,
      js: `function merge(intervals) {
  if (intervals.length === 0) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [];
  let cur = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];
    if (next[0] <= cur[1]) {          // overlap
      cur[1] = Math.max(cur[1], next[1]);
    } else {                          // gap
      res.push(cur);
      cur = next;
    }
  }
  res.push(cur);
  return res;
}
`,
      ts: `function merge(intervals: number[][]): number[][] {
  if (intervals.length === 0) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const res: number[][] = [];
  let cur = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];
    if (next[0] <= cur[1]) {          // overlap
      cur[1] = Math.max(cur[1], next[1]);
    } else {                          // gap
      res.push(cur);
      cur = next;
    }
  }
  res.push(cur);
  return res;
}
`,
      java: `class Solution {
    public int[][] merge(int[][] intervals) {
        if (intervals.length == 0) return new int[0][];
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        List<int[]> res = new ArrayList<>();
        int[] cur = intervals[0];
        for (int i = 1; i < intervals.length; i++) {
            int[] next = intervals[i];
            if (next[0] <= cur[1]) {          // overlap
                cur[1] = Math.max(cur[1], next[1]);
            } else {                          // gap
                res.add(cur);
                cur = next;
            }
        }
        res.add(cur);
        return res.toArray(new int[res.size()][]);
    }
}
`,
      cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if (intervals.empty()) return {};
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> res;
        vector<int> cur = intervals[0];
        for (int i = 1; i < (int)intervals.size(); i++) {
            vector<int>& next = intervals[i];
            if (next[0] <= cur[1]) {          // overlap
                cur[1] = max(cur[1], next[1]);
            } else {                          // gap
                res.push_back(cur);
                cur = next;
            }
        }
        res.push_back(cur);
        return res;
    }
};
`,
    },
  },

  {
    slug: 'course-schedule',
    category: 'graphs',
    title: 'Course Schedule',
    difficulty: 'Medium',
    blurb: 'Decide if all courses can be finished — i.e. the prereq graph has no cycle.',
    tags: ['LeetCode 207', 'Topological Sort', 'BFS'],
    statement:
      'There are numCourses courses labeled 0..numCourses-1. prerequisites[i] = [a, b] means you must take course b before course a. Return true if you can finish all courses, otherwise false.',
    intuition: [
      'Treat each course as a node and each prerequisite [a, b] as an arrow b → a (“take b before a”). You can finish everything exactly when these arrows contain no cycle.',
      'For each course, count how many prerequisites it still needs — its indegree. A course with indegree 0 has nothing blocking it, so it can be taken right now.',
      'Take any ready course and “complete” it: that removes one prerequisite from every course that depended on it. Some of those may drop to indegree 0 and become ready themselves.',
      'Keep taking ready courses. If you take all of them, there was no cycle → true. If you get stuck with courses whose indegree never reaches 0, they depend on each other in a cycle → false.',
    ],
    steps: [
      'Build the graph: for each [a, b] add edge b → a and increment indegree[a].',
      'Put every course with indegree 0 into a queue.',
      'Pop a course, count it as taken, and decrement the indegree of each course it points to; if any reaches 0, enqueue it.',
      'Repeat until the queue is empty.',
      'Return true if the number taken equals numCourses (otherwise a cycle blocked some).',
    ],
    complexity: {
      time: 'O(V + E) — each course and prerequisite is processed once.',
      space: 'O(V + E) for the adjacency list, indegree array, and queue.',
    },
    Visualizer: CourseScheduleViz,
    code: {
      py: `from collections import deque

def canFinish(numCourses, prerequisites):
    adj = [[] for _ in range(numCourses)]
    indeg = [0] * numCourses
    for a, b in prerequisites:
        adj[b].append(a)   # b is a prerequisite of a
        indeg[a] += 1
    queue = deque([c for c in range(numCourses) if indeg[c] == 0])
    taken = 0
    while queue:
        u = queue.popleft()
        taken += 1
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    return taken == numCourses
`,
      js: `function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);    // b is a prerequisite of a
    indeg[a]++;
  }
  const queue = [];
  for (let c = 0; c < numCourses; c++) if (indeg[c] === 0) queue.push(c);
  let taken = 0;
  while (queue.length) {
    const u = queue.shift();
    taken++;
    for (const v of adj[u]) {
      indeg[v]--;
      if (indeg[v] === 0) queue.push(v);
    }
  }
  return taken === numCourses;
}
`,
      ts: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);    // b is a prerequisite of a
    indeg[a]++;
  }
  const queue: number[] = [];
  for (let c = 0; c < numCourses; c++) if (indeg[c] === 0) queue.push(c);
  let taken = 0;
  while (queue.length) {
    const u = queue.shift()!;
    taken++;
    for (const v of adj[u]) {
      indeg[v]--;
      if (indeg[v] === 0) queue.push(v);
    }
  }
  return taken === numCourses;
}
`,
      java: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[numCourses];
        for (int[] p : prerequisites) {
            adj.get(p[1]).add(p[0]);   // p[1] is a prerequisite of p[0]
            indeg[p[0]]++;
        }
        Queue<Integer> queue = new LinkedList<>();
        for (int c = 0; c < numCourses; c++) if (indeg[c] == 0) queue.offer(c);
        int taken = 0;
        while (!queue.isEmpty()) {
            int u = queue.poll();
            taken++;
            for (int v : adj.get(u)) {
                if (--indeg[v] == 0) queue.offer(v);
            }
        }
        return taken == numCourses;
    }
}
`,
      cpp: `class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> indeg(numCourses, 0);
        for (auto& p : prerequisites) {
            adj[p[1]].push_back(p[0]);   // p[1] is a prerequisite of p[0]
            indeg[p[0]]++;
        }
        queue<int> q;
        for (int c = 0; c < numCourses; c++) if (indeg[c] == 0) q.push(c);
        int taken = 0;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            taken++;
            for (int v : adj[u]) {
                if (--indeg[v] == 0) q.push(v);
            }
        }
        return taken == numCourses;
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
    Visualizer: NumberOfIslandsViz,
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
