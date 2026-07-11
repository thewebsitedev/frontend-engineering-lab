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
import CloneGraphViz from './algos/clone-graph/CloneGraphViz'
import KClosestPointsViz from './algos/k-closest-points/KClosestPointsViz'
import ProductExceptSelfViz from './algos/product-except-self/ProductExceptSelfViz'
import LongestSubstringViz from './algos/longest-substring/LongestSubstringViz'
import MeetingRoomsViz from './algos/meeting-rooms/MeetingRoomsViz'
import LRUCacheViz from './algos/lru-cache/LRUCacheViz'
import TrieViz from './algos/trie/TrieViz'
import WordSearchViz from './algos/word-search/WordSearchViz'
import ContainerWithMostWaterViz from './algos/container-with-most-water/ContainerWithMostWaterViz'
import ThreeSumViz from './algos/three-sum/ThreeSumViz'
import TrappingRainWaterViz from './algos/trapping-rain-water/TrappingRainWaterViz'
import CharacterReplacementViz from './algos/character-replacement/CharacterReplacementViz'

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

// Clone Graph has two standard solutions; the visualizer animates the BFS version.
const CLONE_BFS: Record<Lang, string> = {
  py: `from collections import deque

def cloneGraph(node):
    if not node:
        return None
    clones = {node: Node(node.val)}   # original -> copy
    queue = deque([node])
    while queue:
        curr = queue.popleft()
        for nei in curr.neighbors:
            if nei not in clones:
                clones[nei] = Node(nei.val)
                queue.append(nei)
            clones[curr].neighbors.append(clones[nei])
    return clones[node]
`,
  js: `function cloneGraph(node) {
  if (!node) return null;
  const clones = new Map();              // original -> copy
  clones.set(node, new Node(node.val));
  const queue = [node];
  while (queue.length) {
    const curr = queue.shift();
    for (const nei of curr.neighbors) {
      if (!clones.has(nei)) {
        clones.set(nei, new Node(nei.val));
        queue.push(nei);
      }
      clones.get(curr).neighbors.push(clones.get(nei));
    }
  }
  return clones.get(node);
}
`,
  ts: `function cloneGraph(node: Node | null): Node | null {
  if (!node) return null;
  const clones = new Map<Node, Node>();   // original -> copy
  clones.set(node, new Node(node.val));
  const queue: Node[] = [node];
  while (queue.length) {
    const curr = queue.shift()!;
    for (const nei of curr.neighbors) {
      if (!clones.has(nei)) {
        clones.set(nei, new Node(nei.val));
        queue.push(nei);
      }
      clones.get(curr)!.neighbors.push(clones.get(nei)!);
    }
  }
  return clones.get(node)!;
}
`,
  java: `class Solution {
    public Node cloneGraph(Node node) {
        if (node == null) return null;
        Map<Node, Node> clones = new HashMap<>();   // original -> copy
        clones.put(node, new Node(node.val));
        Queue<Node> queue = new LinkedList<>();
        queue.offer(node);
        while (!queue.isEmpty()) {
            Node curr = queue.poll();
            for (Node nei : curr.neighbors) {
                if (!clones.containsKey(nei)) {
                    clones.put(nei, new Node(nei.val));
                    queue.offer(nei);
                }
                clones.get(curr).neighbors.add(clones.get(nei));
            }
        }
        return clones.get(node);
    }
}
`,
  cpp: `class Solution {
public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        unordered_map<Node*, Node*> clones;   // original -> copy
        clones[node] = new Node(node->val);
        queue<Node*> q;
        q.push(node);
        while (!q.empty()) {
            Node* curr = q.front(); q.pop();
            for (Node* nei : curr->neighbors) {
                if (!clones.count(nei)) {
                    clones[nei] = new Node(nei->val);
                    q.push(nei);
                }
                clones[curr]->neighbors.push_back(clones[nei]);
            }
        }
        return clones[node];
    }
};
`,
}

const CLONE_DFS: Record<Lang, string> = {
  py: `def cloneGraph(node):
    clones = {}   # original -> copy

    def dfs(curr):
        if curr in clones:
            return clones[curr]
        copy = Node(curr.val)
        clones[curr] = copy           # record before recursing (handles cycles)
        for nei in curr.neighbors:
            copy.neighbors.append(dfs(nei))
        return copy

    return dfs(node) if node else None
`,
  js: `function cloneGraph(node) {
  const clones = new Map();        // original -> copy
  function dfs(curr) {
    if (clones.has(curr)) return clones.get(curr);
    const copy = new Node(curr.val);
    clones.set(curr, copy);        // record before recursing (handles cycles)
    for (const nei of curr.neighbors) {
      copy.neighbors.push(dfs(nei));
    }
    return copy;
  }
  return node ? dfs(node) : null;
}
`,
  ts: `function cloneGraph(node: Node | null): Node | null {
  const clones = new Map<Node, Node>();   // original -> copy
  function dfs(curr: Node): Node {
    const existing = clones.get(curr);
    if (existing) return existing;
    const copy = new Node(curr.val);
    clones.set(curr, copy);               // record before recursing (handles cycles)
    for (const nei of curr.neighbors) {
      copy.neighbors.push(dfs(nei));
    }
    return copy;
  }
  return node ? dfs(node) : null;
}
`,
  java: `class Solution {
    private Map<Node, Node> clones = new HashMap<>();   // original -> copy

    public Node cloneGraph(Node node) {
        if (node == null) return null;
        if (clones.containsKey(node)) return clones.get(node);
        Node copy = new Node(node.val);
        clones.put(node, copy);            // record before recursing (handles cycles)
        for (Node nei : node.neighbors) {
            copy.neighbors.add(cloneGraph(nei));
        }
        return copy;
    }
}
`,
  cpp: `class Solution {
    unordered_map<Node*, Node*> clones;   // original -> copy
public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        if (clones.count(node)) return clones[node];
        Node* copy = new Node(node->val);
        clones[node] = copy;              // record before recursing (handles cycles)
        for (Node* nei : node->neighbors) {
            copy->neighbors.push_back(cloneGraph(nei));
        }
        return copy;
    }
};
`,
}

// K Closest Points has two standard solutions; the visualizer animates both.
const KCLOSEST_SORT: Record<Lang, string> = {
  py: `def kClosest(points, k):
    # Sort every point by its squared distance to the origin, then take the first k.
    points.sort(key=lambda p: p[0] * p[0] + p[1] * p[1])
    return points[:k]
`,
  js: `function kClosest(points, k) {
  // Pair each point with its squared distance, sort ascending, take the first k.
  const withDist = points.map(([x, y]) => [x * x + y * y, x, y]);
  withDist.sort((a, b) => a[0] - b[0]);
  const result = [];
  for (let i = 0; i < k; i++) {
    result.push([withDist[i][1], withDist[i][2]]);
  }
  return result;
}
`,
  ts: `function kClosest(points: number[][], k: number): number[][] {
  const withDist = points.map(([x, y]) => [x * x + y * y, x, y]);
  withDist.sort((a, b) => a[0] - b[0]);
  const result: number[][] = [];
  for (let i = 0; i < k; i++) {
    result.push([withDist[i][1], withDist[i][2]]);
  }
  return result;
}
`,
  java: `class Solution {
    public int[][] kClosest(int[][] points, int k) {
        // Sort by squared distance, then copy the first k rows.
        Arrays.sort(points, (a, b) ->
            (a[0] * a[0] + a[1] * a[1]) - (b[0] * b[0] + b[1] * b[1]));
        return Arrays.copyOfRange(points, 0, k);
    }
}
`,
  cpp: `class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        sort(points.begin(), points.end(), [](auto& a, auto& b) {
            return a[0] * a[0] + a[1] * a[1] < b[0] * b[0] + b[1] * b[1];
        });
        return vector<vector<int>>(points.begin(), points.begin() + k);
    }
};
`,
}

const KCLOSEST_HEAP: Record<Lang, string> = {
  py: `import heapq

def kClosest(points, k):
    # Max-heap of size k. Python's heapq is a min-heap, so negate the distance.
    heap = []
    for x, y in points:
        d = x * x + y * y
        heapq.heappush(heap, (-d, x, y))
        if len(heap) > k:
            heapq.heappop(heap)   # drop the farthest (largest d)
    return [[x, y] for (_, x, y) in heap]
`,
  js: `function kClosest(points, k) {
  // Keep at most k points; the heap's max (farthest) is dropped when we exceed k.
  const heap = new MaxHeap();        // ordered by distance
  for (const [x, y] of points) {
    const d = x * x + y * y;
    heap.push([d, x, y]);
    if (heap.size() > k) {
      heap.pop();                    // remove the farthest
    }
  }
  return heap.toArray().map(([d, x, y]) => [x, y]);
}
`,
  ts: `function kClosest(points: number[][], k: number): number[][] {
  const heap = new MaxHeap();        // ordered by distance
  for (const [x, y] of points) {
    const d = x * x + y * y;
    heap.push([d, x, y]);
    if (heap.size() > k) {
      heap.pop();                    // remove the farthest
    }
  }
  return heap.toArray().map(([d, x, y]) => [x, y]);
}
`,
  java: `class Solution {
    public int[][] kClosest(int[][] points, int k) {
        // Max-heap keyed by squared distance; keep only the k smallest.
        PriorityQueue<int[]> heap = new PriorityQueue<>(
            (a, b) -> (b[0] * b[0] + b[1] * b[1]) - (a[0] * a[0] + a[1] * a[1]));
        for (int[] p : points) {
            heap.offer(p);
            if (heap.size() > k) heap.poll();   // drop the farthest
        }
        int[][] result = new int[k][2];
        for (int i = 0; i < k; i++) result[i] = heap.poll();
        return result;
    }
}
`,
  cpp: `class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        // Max-heap (default priority_queue) keyed by squared distance.
        priority_queue<pair<int, vector<int>>> heap;
        for (auto& p : points) {
            int d = p[0] * p[0] + p[1] * p[1];
            heap.push({d, p});
            if ((int)heap.size() > k) heap.pop();   // drop the farthest
        }
        vector<vector<int>> result;
        while (!heap.empty()) { result.push_back(heap.top().second); heap.pop(); }
        return result;
    }
};
`,
}

// Product of Array Except Self: the clear two-array version and the O(1)-space two-pass.
const PRODUCT_OPTIMAL: Record<Lang, string> = {
  py: `def productExceptSelf(nums):
    n = len(nums)
    answer = [1] * n
    prefix = 1
    for i in range(n):
        answer[i] = prefix          # product of everything left of i
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        answer[i] *= suffix         # multiply in product of everything right of i
        suffix *= nums[i]
    return answer
`,
  js: `function productExceptSelf(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = prefix;       // product of everything left of i
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= suffix;      // multiply in product of everything right of i
    suffix *= nums[i];
  }
  return answer;
}
`,
  ts: `function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const answer = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = prefix;       // product of everything left of i
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= suffix;      // multiply in product of everything right of i
    suffix *= nums[i];
  }
  return answer;
}
`,
  java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];
        int prefix = 1;
        for (int i = 0; i < n; i++) {
            answer[i] = prefix;       // product of everything left of i
            prefix *= nums[i];
        }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= suffix;      // multiply in product of everything right of i
            suffix *= nums[i];
        }
        return answer;
    }
}
`,
  cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> answer(n, 1);
        int prefix = 1;
        for (int i = 0; i < n; i++) {
            answer[i] = prefix;       // product of everything left of i
            prefix *= nums[i];
        }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= suffix;      // multiply in product of everything right of i
            suffix *= nums[i];
        }
        return answer;
    }
};
`,
}

const PRODUCT_TWO_ARRAYS: Record<Lang, string> = {
  py: `def productExceptSelf(nums):
    n = len(nums)
    left = [1] * n          # left[i]  = product of everything before i
    right = [1] * n         # right[i] = product of everything after i
    for i in range(1, n):
        left[i] = left[i - 1] * nums[i - 1]
    for i in range(n - 2, -1, -1):
        right[i] = right[i + 1] * nums[i + 1]
    return [left[i] * right[i] for i in range(n)]
`,
  js: `function productExceptSelf(nums) {
  const n = nums.length;
  const left = new Array(n).fill(1);   // left[i]  = product before i
  const right = new Array(n).fill(1);  // right[i] = product after i
  for (let i = 1; i < n; i++) {
    left[i] = left[i - 1] * nums[i - 1];
  }
  for (let i = n - 2; i >= 0; i--) {
    right[i] = right[i + 1] * nums[i + 1];
  }
  const answer = new Array(n);
  for (let i = 0; i < n; i++) answer[i] = left[i] * right[i];
  return answer;
}
`,
  ts: `function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const left = new Array(n).fill(1);   // left[i]  = product before i
  const right = new Array(n).fill(1);  // right[i] = product after i
  for (let i = 1; i < n; i++) {
    left[i] = left[i - 1] * nums[i - 1];
  }
  for (let i = n - 2; i >= 0; i--) {
    right[i] = right[i + 1] * nums[i + 1];
  }
  const answer = new Array(n);
  for (let i = 0; i < n; i++) answer[i] = left[i] * right[i];
  return answer;
}
`,
  java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] left = new int[n];
        int[] right = new int[n];
        left[0] = 1;
        right[n - 1] = 1;
        for (int i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
        for (int i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
        int[] answer = new int[n];
        for (int i = 0; i < n; i++) answer[i] = left[i] * right[i];
        return answer;
    }
}
`,
  cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> left(n, 1), right(n, 1), answer(n);
        for (int i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
        for (int i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
        for (int i = 0; i < n; i++) answer[i] = left[i] * right[i];
        return answer;
    }
};
`,
}

// Longest Substring Without Repeating Characters: sliding window with a last-seen map.
const LONGEST_SUBSTRING: Record<Lang, string> = {
  py: `def lengthOfLongestSubstring(s):
    seen = {}            # char -> last index
    left = 0
    best = 0
    for right, c in enumerate(s):
        if c in seen and seen[c] >= left:
            left = seen[c] + 1     # jump past the previous occurrence
        seen[c] = right
        best = max(best, right - left + 1)
    return best
`,
  js: `function lengthOfLongestSubstring(s) {
  const seen = new Map();   // char -> last index
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (seen.has(c) && seen.get(c) >= left) {
      left = seen.get(c) + 1;     // jump past the previous occurrence
    }
    seen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
  ts: `function lengthOfLongestSubstring(s: string): number {
  const seen = new Map<string, number>();   // char -> last index
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (seen.has(c) && seen.get(c)! >= left) {
      left = seen.get(c)! + 1;     // jump past the previous occurrence
    }
    seen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
  java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> seen = new HashMap<>();   // char -> last index
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (seen.containsKey(c) && seen.get(c) >= left) {
                left = seen.get(c) + 1;     // jump past the previous occurrence
            }
            seen.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
`,
  cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> seen;   // char -> last index
        int left = 0, best = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            char c = s[right];
            if (seen.count(c) && seen[c] >= left) {
                left = seen[c] + 1;     // jump past the previous occurrence
            }
            seen[c] = right;
            best = max(best, right - left + 1);
        }
        return best;
    }
};
`,
}

// Meeting Rooms 252 (can attend all?) — sort, then check neighbouring overlaps.
const MEETING_252: Record<Lang, string> = {
  py: `def canAttendMeetings(intervals):
    intervals.sort(key=lambda x: x[0])
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i - 1][1]:
            return False          # this meeting starts before the last one ends
    return True
`,
  js: `function canAttendMeetings(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < intervals[i - 1][1]) {
      return false;     // starts before the previous meeting ends
    }
  }
  return true;
}
`,
  ts: `function canAttendMeetings(intervals: number[][]): boolean {
  intervals.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < intervals[i - 1][1]) {
      return false;     // starts before the previous meeting ends
    }
  }
  return true;
}
`,
  java: `class Solution {
    public boolean canAttendMeetings(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] < intervals[i - 1][1]) {
                return false;   // starts before the previous meeting ends
            }
        }
        return true;
    }
}
`,
  cpp: `class Solution {
public:
    bool canAttendMeetings(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        for (int i = 1; i < (int)intervals.size(); i++) {
            if (intervals[i][0] < intervals[i - 1][1]) {
                return false;   // starts before the previous meeting ends
            }
        }
        return true;
    }
};
`,
}

// Meeting Rooms 253 (minimum rooms) — sort by start, min-heap of end times.
const MEETING_253: Record<Lang, string> = {
  py: `import heapq

def minMeetingRooms(intervals):
    intervals.sort(key=lambda x: x[0])
    heap = []                       # end times of meetings in progress
    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heappop(heap)     # earliest meeting ended; reuse its room
        heapq.heappush(heap, end)
    return len(heap)
`,
  js: `function minMeetingRooms(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const heap = new MinHeap();        // end times of meetings in progress
  for (const [start, end] of intervals) {
    if (heap.size() > 0 && heap.peek() <= start) {
      heap.pop();                    // earliest meeting ended; reuse its room
    }
    heap.push(end);
  }
  return heap.size();
}
`,
  ts: `function minMeetingRooms(intervals: number[][]): number {
  intervals.sort((a, b) => a[0] - b[0]);
  const heap = new MinHeap();        // end times of meetings in progress
  for (const [start, end] of intervals) {
    if (heap.size() > 0 && heap.peek() <= start) {
      heap.pop();                    // earliest meeting ended; reuse its room
    }
    heap.push(end);
  }
  return heap.size();
}
`,
  java: `class Solution {
    public int minMeetingRooms(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        PriorityQueue<Integer> heap = new PriorityQueue<>();   // min-heap of end times
        for (int[] iv : intervals) {
            if (!heap.isEmpty() && heap.peek() <= iv[0]) {
                heap.poll();          // earliest meeting ended; reuse its room
            }
            heap.offer(iv[1]);
        }
        return heap.size();
    }
}
`,
  cpp: `class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        priority_queue<int, vector<int>, greater<int>> heap;   // min-heap of end times
        for (auto& iv : intervals) {
            if (!heap.empty() && heap.top() <= iv[0]) {
                heap.pop();           // earliest meeting ended; reuse its room
            }
            heap.push(iv[1]);
        }
        return heap.size();
    }
};
`,
}

// LRU Cache: the concise ordered-Map version (animated) and the classic hashmap + DLL.
const LRU_MAP: Record<Lang, string> = {
  py: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = OrderedDict()      # oldest → newest

    def get(self, key):
        if key not in self.map:
            return -1
        self.map.move_to_end(key)     # renew as newest
        return self.map[key]

    def put(self, key, value):
        if key in self.map:
            self.map.move_to_end(key)
        self.map[key] = value
        if len(self.map) > self.cap:
            self.map.popitem(last=False)   # evict oldest
`,
  js: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();   // oldest → newest
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const v = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, v);    // renew as newest
    return v;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      const lru = this.map.keys().next().value;
      this.map.delete(lru);   // evict oldest
    }
  }
}
`,
  ts: `class LRUCache {
  private cap: number;
  private map = new Map<number, number>();   // oldest → newest
  constructor(capacity: number) {
    this.cap = capacity;
  }
  get(key: number): number {
    if (!this.map.has(key)) return -1;
    const v = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, v);    // renew as newest
    return v;
  }
  put(key: number, value: number): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      const lru = this.map.keys().next().value as number;
      this.map.delete(lru);   // evict oldest
    }
  }
}
`,
  java: `class LRUCache {
    private final int cap;
    // LinkedHashMap keeps insertion order; accessOrder=true moves reads to the end.
    private final LinkedHashMap<Integer, Integer> map;

    public LRUCache(int capacity) {
        this.cap = capacity;
        this.map = new LinkedHashMap<>(16, 0.75f, true) {
            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> e) {
                return size() > cap;   // evict oldest automatically
            }
        };
    }
    public int get(int key) {
        return map.getOrDefault(key, -1);
    }
    public void put(int key, int value) {
        map.put(key, value);
    }
}
`,
  cpp: `class LRUCache {
    int cap;
    list<pair<int,int>> items;                       // front = newest, back = oldest
    unordered_map<int, list<pair<int,int>>::iterator> pos;
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        if (!pos.count(key)) return -1;
        items.splice(items.begin(), items, pos[key]);   // move to front
        return pos[key]->second;
    }
    void put(int key, int value) {
        if (pos.count(key)) items.erase(pos[key]);
        items.push_front({key, value});
        pos[key] = items.begin();
        if ((int)items.size() > cap) {
            pos.erase(items.back().first);
            items.pop_back();                            // evict oldest
        }
    }
};
`,
}

const LRU_DLL: Record<Lang, string> = {
  py: `class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}                 # key -> Node
        self.head, self.tail = Node(), Node()   # sentinels: head=MRU side, tail=LRU side
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node):       # right after head = most recent
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_front(node)
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev      # node before tail = least recent
            self._remove(lru)
            del self.map[lru.key]
`,
  js: `class Node {
  constructor(key = 0, val = 0) {
    this.key = key; this.val = val;
    this.prev = null; this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();              // key -> Node
    this.head = new Node();            // MRU side
    this.tail = new Node();            // LRU side
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  _addFront(node) {                    // right after head = most recent
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._addFront(node);
    return node.val;
  }
  put(key, value) {
    if (this.map.has(key)) this._remove(this.map.get(key));
    const node = new Node(key, value);
    this.map.set(key, node);
    this._addFront(node);
    if (this.map.size > this.cap) {
      const lru = this.tail.prev;      // node before tail = least recent
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }
}
`,
  ts: `class DNode {
  key: number; val: number;
  prev: DNode | null = null;
  next: DNode | null = null;
  constructor(key = 0, val = 0) { this.key = key; this.val = val; }
}

class LRUCache {
  private cap: number;
  private map = new Map<number, DNode>();
  private head = new DNode();   // MRU side
  private tail = new DNode();   // LRU side
  constructor(capacity: number) {
    this.cap = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  private remove(node: DNode) {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }
  private addFront(node: DNode) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }
  get(key: number): number {
    const node = this.map.get(key);
    if (!node) return -1;
    this.remove(node);
    this.addFront(node);
    return node.val;
  }
  put(key: number, value: number): void {
    const existing = this.map.get(key);
    if (existing) this.remove(existing);
    const node = new DNode(key, value);
    this.map.set(key, node);
    this.addFront(node);
    if (this.map.size > this.cap) {
      const lru = this.tail.prev!;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }
}
`,
  java: `class LRUCache {
    class Node { int key, val; Node prev, next; Node(int k, int v) { key = k; val = v; } }

    private final int cap;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0);   // MRU side
    private final Node tail = new Node(0, 0);   // LRU side

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail;
        tail.prev = head;
    }
    private void remove(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
    private void addFront(Node n) {
        n.next = head.next; n.prev = head;
        head.next.prev = n; head.next = n;
    }
    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node n = map.get(key);
        remove(n); addFront(n);
        return n.val;
    }
    public void put(int key, int value) {
        if (map.containsKey(key)) remove(map.get(key));
        Node n = new Node(key, value);
        map.put(key, n);
        addFront(n);
        if (map.size() > cap) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }
}
`,
  cpp: `class LRUCache {
    struct Node { int key, val; Node *prev, *next; Node(int k, int v) : key(k), val(v), prev(nullptr), next(nullptr) {} };
    int cap;
    unordered_map<int, Node*> map;
    Node *head, *tail;   // head = MRU side, tail = LRU side
    void remove(Node* n) { n->prev->next = n->next; n->next->prev = n->prev; }
    void addFront(Node* n) {
        n->next = head->next; n->prev = head;
        head->next->prev = n; head->next = n;
    }
public:
    LRUCache(int capacity) : cap(capacity) {
        head = new Node(0, 0); tail = new Node(0, 0);
        head->next = tail; tail->prev = head;
    }
    int get(int key) {
        if (!map.count(key)) return -1;
        Node* n = map[key];
        remove(n); addFront(n);
        return n->val;
    }
    void put(int key, int value) {
        if (map.count(key)) remove(map[key]);
        Node* n = new Node(key, value);
        map[key] = n;
        addFront(n);
        if ((int)map.size() > cap) {
            Node* lru = tail->prev;
            remove(lru);
            map.erase(lru->key);
        }
    }
};
`,
}

// Implement Trie (Prefix Tree): a tree of character branches with end-of-word flags.
const TRIE_CODE: Record<Lang, string> = {
  py: `class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for c in word:
            node = node.setdefault(c, {})   # create branch if missing
        node['$'] = True                    # mark end of word

    def search(self, word):
        node = self.root
        for c in word:
            if c not in node:
                return False
            node = node[c]
        return '$' in node

    def startsWith(self, prefix):
        node = self.root
        for c in prefix:
            if c not in node:
                return False
            node = node[c]
        return True
`,
  js: `class Trie {
  constructor() {
    this.root = {};
  }
  insert(word) {
    let node = this.root;
    for (const c of word) {
      if (!node[c]) node[c] = {};   // create branch if missing
      node = node[c];
    }
    node.end = true;                // mark end of word
  }
  search(word) {
    let node = this.root;
    for (const c of word) {
      if (!node[c]) return false;
      node = node[c];
    }
    return node.end === true;
  }
  startsWith(prefix) {
    let node = this.root;
    for (const c of prefix) {
      if (!node[c]) return false;
      node = node[c];
    }
    return true;
  }
}
`,
  ts: `class TrieNode {
  children: Record<string, TrieNode> = {};
  end = false;
}

class Trie {
  private root = new TrieNode();
  insert(word: string): void {
    let node = this.root;
    for (const c of word) {
      if (!node.children[c]) node.children[c] = new TrieNode();
      node = node.children[c];
    }
    node.end = true;
  }
  search(word: string): boolean {
    let node = this.root;
    for (const c of word) {
      if (!node.children[c]) return false;
      node = node.children[c];
    }
    return node.end;
  }
  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const c of prefix) {
      if (!node.children[c]) return false;
      node = node.children[c];
    }
    return true;
  }
}
`,
  java: `class Trie {
    private static class Node {
        Node[] children = new Node[26];
        boolean end;
    }
    private final Node root = new Node();

    public void insert(String word) {
        Node node = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) node.children[i] = new Node();
            node = node.children[i];
        }
        node.end = true;
    }
    public boolean search(String word) {
        Node node = walk(word);
        return node != null && node.end;
    }
    public boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }
    private Node walk(String s) {
        Node node = root;
        for (char c : s.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) return null;
            node = node.children[i];
        }
        return node;
    }
}
`,
  cpp: `class Trie {
    struct Node {
        Node* children[26] = {};
        bool end = false;
    };
    Node* root;
    Node* walk(const string& s) {
        Node* node = root;
        for (char c : s) {
            int i = c - 'a';
            if (!node->children[i]) return nullptr;
            node = node->children[i];
        }
        return node;
    }
public:
    Trie() { root = new Node(); }
    void insert(string word) {
        Node* node = root;
        for (char c : word) {
            int i = c - 'a';
            if (!node->children[i]) node->children[i] = new Node();
            node = node->children[i];
        }
        node->end = true;
    }
    bool search(string word) {
        Node* node = walk(word);
        return node && node->end;
    }
    bool startsWith(string prefix) {
        return walk(prefix) != nullptr;
    }
};
`,
}

// Word Search: DFS from each cell, marking the path used and backtracking on dead ends.
const WORD_SEARCH: Record<Lang, string> = {
  py: `def exist(board, word):
    R, C = len(board), len(board[0])

    def dfs(r, c, i):
        if i == len(word):
            return True
        if r < 0 or c < 0 or r >= R or c >= C:
            return False
        if board[r][c] != word[i]:
            return False
        tmp = board[r][c]
        board[r][c] = '#'                     # mark used
        found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or
                 dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
        board[r][c] = tmp                     # backtrack
        return found

    for r in range(R):
        for c in range(C):
            if dfs(r, c, 0):
                return True
    return False
`,
  js: `function exist(board, word) {
  const R = board.length, C = board[0].length;
  function dfs(r, c, i) {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= R || c >= C) return false;
    if (board[r][c] !== word[i]) return false;
    const tmp = board[r][c];
    board[r][c] = '#';                        // mark used
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1)
               || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    board[r][c] = tmp;                         // backtrack
    return found;
  }
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (dfs(r, c, 0)) return true;
  return false;
}
`,
  ts: `function exist(board: string[][], word: string): boolean {
  const R = board.length, C = board[0].length;
  function dfs(r: number, c: number, i: number): boolean {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= R || c >= C) return false;
    if (board[r][c] !== word[i]) return false;
    const tmp = board[r][c];
    board[r][c] = '#';                        // mark used
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1)
               || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    board[r][c] = tmp;                         // backtrack
    return found;
  }
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (dfs(r, c, 0)) return true;
  return false;
}
`,
  java: `class Solution {
    private int R, C;
    private char[][] board;
    private String word;

    public boolean exist(char[][] board, String word) {
        this.board = board; this.word = word;
        R = board.length; C = board[0].length;
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++)
                if (dfs(r, c, 0)) return true;
        return false;
    }
    private boolean dfs(int r, int c, int i) {
        if (i == word.length()) return true;
        if (r < 0 || c < 0 || r >= R || c >= C) return false;
        if (board[r][c] != word.charAt(i)) return false;
        char tmp = board[r][c];
        board[r][c] = '#';                    // mark used
        boolean found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1)
                     || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
        board[r][c] = tmp;                    // backtrack
        return found;
    }
}
`,
  cpp: `class Solution {
    int R, C;
    bool dfs(vector<vector<char>>& board, const string& word, int r, int c, int i) {
        if (i == (int)word.size()) return true;
        if (r < 0 || c < 0 || r >= R || c >= C) return false;
        if (board[r][c] != word[i]) return false;
        char tmp = board[r][c];
        board[r][c] = '#';                    // mark used
        bool found = dfs(board, word, r + 1, c, i + 1) || dfs(board, word, r - 1, c, i + 1)
                  || dfs(board, word, r, c + 1, i + 1) || dfs(board, word, r, c - 1, i + 1);
        board[r][c] = tmp;                    // backtrack
        return found;
    }
public:
    bool exist(vector<vector<char>>& board, string word) {
        R = board.size(); C = board[0].size();
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }
};
`,
}

// Container With Most Water: two pointers from the ends, move the shorter wall in.
const CONTAINER_WATER: Record<Lang, string> = {
  py: `def maxArea(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        h = min(height[left], height[right])
        best = max(best, h * (right - left))
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return best
`,
  js: `function maxArea(height) {
  let left = 0, right = height.length - 1;
  let best = 0;
  while (left < right) {
    const h = Math.min(height[left], height[right]);
    best = Math.max(best, h * (right - left));
    if (height[left] < height[right]) left++;
    else right--;
  }
  return best;
}
`,
  ts: `function maxArea(height: number[]): number {
  let left = 0, right = height.length - 1;
  let best = 0;
  while (left < right) {
    const h = Math.min(height[left], height[right]);
    best = Math.max(best, h * (right - left));
    if (height[left] < height[right]) left++;
    else right--;
  }
  return best;
}
`,
  java: `class Solution {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1, best = 0;
        while (left < right) {
            int h = Math.min(height[left], height[right]);
            best = Math.max(best, h * (right - left));
            if (height[left] < height[right]) left++;
            else right--;
        }
        return best;
    }
}
`,
  cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = height.size() - 1, best = 0;
        while (left < right) {
            int h = min(height[left], height[right]);
            best = max(best, h * (right - left));
            if (height[left] < height[right]) left++;
            else right--;
        }
        return best;
    }
};
`,
}

// 3Sum: sort, then fix an anchor and two-pointer the rest; skip duplicates.
const THREE_SUM: Record<Lang, string> = {
  py: `def threeSum(nums):
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                          # skip duplicate anchor
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                res.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1
                while left < right and nums[left] == nums[left - 1]:
                    left += 1
                while left < right and nums[right] == nums[right + 1]:
                    right -= 1
    return res
`,
  js: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;   // skip duplicate anchor
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum < 0) left++;
      else if (sum > 0) right--;
      else {
        res.push([nums[i], nums[left], nums[right]]);
        left++; right--;
        while (left < right && nums[left] === nums[left - 1]) left++;
        while (left < right && nums[right] === nums[right + 1]) right--;
      }
    }
  }
  return res;
}
`,
  ts: `function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const res: number[][] = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;   // skip duplicate anchor
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum < 0) left++;
      else if (sum > 0) right--;
      else {
        res.push([nums[i], nums[left], nums[right]]);
        left++; right--;
        while (left < right && nums[left] === nums[left - 1]) left++;
        while (left < right && nums[right] === nums[right + 1]) right--;
      }
    }
  }
  return res;
}
`,
  java: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;   // skip duplicate anchor
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum < 0) left++;
                else if (sum > 0) right--;
                else {
                    res.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    left++; right--;
                    while (left < right && nums[left] == nums[left - 1]) left++;
                    while (left < right && nums[right] == nums[right + 1]) right--;
                }
            }
        }
        return res;
    }
}
`,
  cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        for (int i = 0; i < (int)nums.size() - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;   // skip duplicate anchor
            int left = i + 1, right = nums.size() - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum < 0) left++;
                else if (sum > 0) right--;
                else {
                    res.push_back({nums[i], nums[left], nums[right]});
                    left++; right--;
                    while (left < right && nums[left] == nums[left - 1]) left++;
                    while (left < right && nums[right] == nums[right + 1]) right--;
                }
            }
        }
        return res;
    }
};
`,
}

// Trapping Rain Water: two pointers, resolve the shorter side against its running max.
const TRAPPING_WATER: Record<Lang, string> = {
  py: `def trap(height):
    left, right = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]
            right -= 1
    return water
`,
  js: `function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left];
      left++;
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right];
      right--;
    }
  }
  return water;
}
`,
  ts: `function trap(height: number[]): number {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left];
      left++;
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right];
      right--;
    }
  }
  return water;
}
`,
  java: `class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                leftMax = Math.max(leftMax, height[left]);
                water += leftMax - height[left];
                left++;
            } else {
                rightMax = Math.max(rightMax, height[right]);
                water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}
`,
  cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                leftMax = max(leftMax, height[left]);
                water += leftMax - height[left];
                left++;
            } else {
                rightMax = max(rightMax, height[right]);
                water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
};
`,
}

// Longest Repeating Character Replacement: sliding window, valid when len - maxFreq <= k.
const CHARACTER_REPLACEMENT: Record<Lang, string> = {
  py: `def characterReplacement(s, k):
    count = {}
    left = max_freq = best = 0
    for right, c in enumerate(s):
        count[c] = count.get(c, 0) + 1
        max_freq = max(max_freq, count[c])
        while (right - left + 1) - max_freq > k:
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
`,
  js: `function characterReplacement(s, k) {
  const count = {};
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    count[c] = (count[c] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[c]);
    while ((right - left + 1) - maxFreq > k) {
      count[s[left]]--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
  ts: `function characterReplacement(s: string, k: number): number {
  const count: Record<string, number> = {};
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    count[c] = (count[c] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[c]);
    while ((right - left + 1) - maxFreq > k) {
      count[s[left]]--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
  java: `class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0, maxFreq = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            maxFreq = Math.max(maxFreq, ++count[s.charAt(right) - 'A']);
            while ((right - left + 1) - maxFreq > k) {
                count[s.charAt(left) - 'A']--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
`,
  cpp: `class Solution {
public:
    int characterReplacement(string s, int k) {
        vector<int> count(26, 0);
        int left = 0, maxFreq = 0, best = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            maxFreq = max(maxFreq, ++count[s[right] - 'A']);
            while ((right - left + 1) - maxFreq > k) {
                count[s[left] - 'A']--;
                left++;
            }
            best = max(best, right - left + 1);
        }
        return best;
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
    slug: 'two-pointers',
    name: 'Two Pointers',
    blurb: 'Walk a pair of indices inward (or together) to avoid nested loops.',
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
    slug: 'heap',
    name: 'Heap / Priority Queue',
    blurb: 'Keep the best k items on hand without sorting everything.',
  },
  {
    slug: 'sliding-window',
    name: 'Sliding Window',
    blurb: 'Slide a range over a sequence, expanding and shrinking as you go.',
  },
  {
    slug: 'linked-list',
    name: 'Linked List',
    blurb: 'Pointer juggling, ordered structures, and O(1) reordering tricks.',
  },
  {
    slug: 'tries',
    name: 'Tries',
    blurb: 'Prefix trees for fast word and prefix lookups.',
  },
  {
    slug: 'backtracking',
    name: 'Backtracking',
    blurb: 'Explore choices depth-first, undoing each one when it dead-ends.',
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
    slug: 'product-except-self',
    category: 'arrays-hashing',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    blurb: 'Each answer[i] is the product of all other elements — no division, in O(n).',
    tags: ['LeetCode 238', 'Prefix Product', 'Arrays'],
    statement:
      'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The algorithm must run in O(n) time and without using the division operation.',
    intuition: [
      'The product of everything except nums[i] is just (product of everything to its LEFT) × (product of everything to its RIGHT). If you have both, you are done.',
      'Build the left products in one forward pass: keep a running prefix and, before folding nums[i] in, store the prefix into answer[i].',
      'Then sweep backward with a running suffix and multiply it into answer[i]. Now each cell holds left × right.',
      'Why no division? Division would fail on zeros and is disallowed here. The two-pass prefix/suffix trick sidesteps it entirely.',
    ],
    steps: [
      'Fill answer with 1s.',
      'Forward pass: set answer[i] = prefix, then prefix *= nums[i].',
      'Backward pass: multiply answer[i] *= suffix, then suffix *= nums[i].',
      'answer now holds the product of all elements except self.',
    ],
    complexity: {
      time: 'O(n) — two linear passes.',
      space: 'O(1) extra — the output array does not count; only prefix and suffix scalars are used.',
    },
    Visualizer: ProductExceptSelfViz,
    code: PRODUCT_OPTIMAL,
    solutions: [
      {
        name: '1 · Prefix × suffix, O(1) extra space',
        blurb:
          'Store left products in answer during a forward pass, then multiply right products in during a backward pass. This is the version animated above.',
        code: PRODUCT_OPTIMAL,
      },
      {
        name: '2 · Two helper arrays (easier to read)',
        blurb:
          'Keep explicit left[] and right[] arrays, then multiply them position by position. Same O(n) time but O(n) extra space — a clearer stepping stone to the optimal version.',
        code: PRODUCT_TWO_ARRAYS,
      },
    ],
  },

  {
    slug: 'container-with-most-water',
    category: 'two-pointers',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    blurb: 'Pick two walls that trap the most water — one linear two-pointer pass.',
    tags: ['LeetCode 11', 'Two Pointers', 'Greedy'],
    statement:
      'You are given an array height where height[i] is the height of a vertical line at position i. Pick two lines that, together with the x-axis, form a container holding the most water. Return that maximum area. The area between lines i and j is min(height[i], height[j]) × (j − i).',
    intuition: [
      'Start as wide as possible: one pointer at each end. Width is largest here, so this is a strong starting candidate.',
      'The water is capped by the SHORTER of the two walls, so the height of the container is min(left, right).',
      'To have any chance of a bigger area you must move a pointer inward — but that shrinks the width. Moving the taller wall can never help (height is still capped by the shorter one), so always move the shorter wall.',
      'Each step discards exactly the wall that can’t do better, so a single pass from both ends finds the maximum in O(n).',
    ],
    steps: [
      'Put left at 0 and right at the last index; track the best area.',
      'Compute area = min(height[left], height[right]) × (right − left) and update best.',
      'Move whichever pointer is at the shorter wall one step inward.',
      'Repeat until the pointers meet; return best.',
    ],
    complexity: { time: 'O(n) — each pointer moves inward at most n times.', space: 'O(1).' },
    Visualizer: ContainerWithMostWaterViz,
    code: CONTAINER_WATER,
  },

  {
    slug: 'three-sum',
    category: 'two-pointers',
    title: '3Sum',
    difficulty: 'Medium',
    blurb: 'Find every unique triplet that sums to zero — sort, then two-pointer.',
    tags: ['LeetCode 15', 'Two Pointers', 'Sorting'],
    statement:
      'Given an integer array nums, return all unique triplets [a, b, c] such that a + b + c = 0. The solution set must not contain duplicate triplets.',
    intuition: [
      'Sorting unlocks the two-pointer trick and makes duplicate-skipping easy, at a cost of only O(n log n).',
      'Fix one number as an anchor (nums[i]); the problem reduces to “find two numbers in the rest that sum to −nums[i]” — the classic sorted two-pointer scan.',
      'With left just after the anchor and right at the end: if the sum is too small move left up (bigger), if too big move right down (smaller), if exactly zero record it.',
      'Skip duplicate values for the anchor and after finding a triplet, so each combination is reported once. Overall O(n²).',
    ],
    steps: [
      'Sort nums.',
      'For each anchor i (skipping repeats), set left = i + 1, right = n − 1.',
      'While left < right, compare nums[i] + nums[left] + nums[right] to 0 and move the appropriate pointer.',
      'On a zero sum, record the triplet, move both pointers, and skip any duplicate values.',
      'Return all collected triplets.',
    ],
    complexity: { time: 'O(n²) — an O(n) two-pointer scan for each of n anchors.', space: 'O(1) beyond the output (ignoring the sort).' },
    Visualizer: ThreeSumViz,
    code: THREE_SUM,
  },

  {
    slug: 'trapping-rain-water',
    category: 'two-pointers',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    blurb: 'Sum the water trapped between bars — two pointers, O(1) space.',
    tags: ['LeetCode 42', 'Two Pointers', 'Dynamic Programming'],
    statement:
      'Given an array height representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    intuition: [
      'Water above a bar is limited by the tallest wall to its left and the tallest to its right: trapped = min(leftMax, rightMax) − height[i].',
      'Use two pointers with running maxima leftMax and rightMax. The clever part: whichever side currently has the SHORTER wall is the binding constraint, so that column’s water is fully determined right now.',
      'If height[left] < height[right], then leftMax is guaranteed ≤ rightMax for the left column, so add leftMax − height[left] and move left inward. Otherwise do the mirror on the right.',
      'This resolves one column per step in a single pass — O(n) time and O(1) space, no prefix arrays needed.',
    ],
    steps: [
      'Put left at 0 and right at the end; track leftMax, rightMax, and total water.',
      'Compare height[left] and height[right]; work on the shorter side.',
      'Update that side’s running max, add (max − height) to water, and step that pointer inward.',
      'Repeat until the pointers meet; return the total.',
    ],
    complexity: { time: 'O(n) — single pass.', space: 'O(1).' },
    Visualizer: TrappingRainWaterViz,
    code: TRAPPING_WATER,
  },

  {
    slug: 'character-replacement',
    category: 'sliding-window',
    title: 'Longest Repeating Character Replacement',
    difficulty: 'Medium',
    blurb: 'Longest run you can make uniform with at most k replacements — sliding window.',
    tags: ['LeetCode 424', 'Sliding Window', 'Hash Map'],
    statement:
      'You are given a string s and an integer k. You may replace at most k characters with any uppercase letter. Return the length of the longest substring that can be made up of a single repeated character after those replacements.',
    intuition: [
      'A window can be made uniform if the number of characters to replace — its length minus the count of its most frequent letter — is at most k.',
      'Grow a window to the right, keeping a tally of letter counts and the highest count seen (maxFreq).',
      'Whenever (window length − maxFreq) exceeds k, the window needs too many replacements: shrink it from the left until it is valid again.',
      'Track the largest valid window length. (maxFreq is never decreased on shrink; that is fine because the answer only ever grows.)',
    ],
    steps: [
      'Keep a count map, a left pointer, maxFreq, and best.',
      'For each right, add s[right] to the counts and update maxFreq.',
      'While (right − left + 1) − maxFreq > k, remove s[left] and advance left.',
      'Update best with the current window length; return best.',
    ],
    complexity: { time: 'O(n) — each pointer advances at most n times.', space: 'O(1) — at most 26 letter counts.' },
    Visualizer: CharacterReplacementViz,
    code: CHARACTER_REPLACEMENT,
  },

  {
    slug: 'longest-substring',
    category: 'sliding-window',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    blurb: 'Slide a window that never repeats a character and track its longest length.',
    tags: ['LeetCode 3', 'Sliding Window', 'Hash Map'],
    statement:
      'Given a string s, find the length of the longest substring without repeating characters. A substring is a contiguous run of characters.',
    intuition: [
      'Keep a window [left, right] that always contains distinct characters. Move right forward one step at a time to grow it.',
      'Remember the last index where you saw each character in a map. When the new character already sits inside the window, you must shrink from the left.',
      'Instead of moving left one step at a time, jump it directly to one past the previous occurrence — that instantly removes the repeat.',
      'After each step the window is valid again, so record its length and keep the best you have seen.',
    ],
    steps: [
      'Track left (window start), best length, and a map of each character’s last index.',
      'For each right, read c = s[right].',
      'If c was seen at an index ≥ left, move left to that index + 1.',
      'Record c’s new index, then update best with the current window length right − left + 1.',
      'Return best after scanning the whole string.',
    ],
    complexity: {
      time: 'O(n) — right scans once and left only moves forward.',
      space: 'O(min(n, alphabet)) for the last-seen map.',
    },
    Visualizer: LongestSubstringViz,
    code: LONGEST_SUBSTRING,
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
    slug: 'meeting-rooms',
    category: 'intervals',
    title: 'Meeting Rooms',
    difficulty: 'Medium',
    blurb: 'Can one person attend every meeting (252) — and how many rooms are needed (253)?',
    tags: ['LeetCode 252', 'LeetCode 253', 'Intervals', 'Heap'],
    statement:
      'Given an array of meeting time intervals where intervals[i] = [start, end]: (252) determine if a person could attend all meetings — i.e. no two overlap. (253) Return the minimum number of conference rooms required to hold all the meetings. (End is treated as exclusive: [5,10] and [10,15] do not conflict.)',
    intuition: [
      'Sort the meetings by start time. Once sorted, you only ever have to think about how a meeting relates to the ones already in progress.',
      '252 — Can attend all? After sorting, an overlap can only occur between back-to-back neighbours. If any meeting starts before its predecessor ends, the answer is false.',
      '253 — Minimum rooms? Keep a min-heap of the END times of meetings currently using a room. The smallest end is the soonest a room frees up.',
      'For each meeting, if the soonest-ending room is already free (its end ≤ this start), reuse it (pop); then add this meeting’s end. The number of rooms is the most that are ever in the heap at once.',
    ],
    steps: [
      'Sort the intervals by start time.',
      '252: scan neighbours — if intervals[i].start < intervals[i-1].end, return false; else return true.',
      '253: keep a min-heap of end times; for each meeting, pop if heap.peek() ≤ start, then push the end.',
      '253: the heap size never shrinks below its peak — that peak is the answer.',
    ],
    complexity: {
      time: 'O(n log n) — dominated by the sort (the heap operations are O(n log n) total).',
      space: 'O(n) for the heap (252 needs only O(1) beyond the sort).',
    },
    Visualizer: MeetingRoomsViz,
    code: MEETING_253,
    solutions: [
      {
        name: '252 · Can attend all? — sort + neighbour check',
        blurb:
          'Sort by start, then a single pass: if any meeting begins before the previous one ends, they overlap. O(n log n) time, O(1) extra space.',
        code: MEETING_252,
      },
      {
        name: '253 · Minimum rooms — sort + min-heap',
        blurb:
          'Sort by start and keep a min-heap of end times. Reuse the soonest-freeing room when possible; the peak heap size is the rooms needed. This is the version animated above.',
        code: MEETING_253,
      },
    ],
  },

  {
    slug: 'lru-cache',
    category: 'linked-list',
    title: 'LRU Cache',
    difficulty: 'Medium',
    blurb: 'Design a fixed-size cache that evicts the least-recently-used key — all in O(1).',
    tags: ['LeetCode 146', 'Hash Map', 'Linked List', 'Design'],
    statement:
      'Design a data structure for a Least Recently Used (LRU) cache supporting get(key) and put(key, value) in O(1) average time. get returns the value if present (and marks it as recently used) or -1. put inserts/updates a key (marking it recently used); if this exceeds the capacity, evict the least recently used key.',
    intuition: [
      'Two needs: O(1) lookup by key, and O(1) knowledge of which key is the “oldest”. A hash map gives the first; an ordering that you can update cheaply gives the second.',
      'Keep entries in recency order: least-recently-used at one end, most-recently-used at the other. Every access moves its entry to the MRU end.',
      'On get, if the key exists, move it to the MRU end and return it. On put, insert/refresh at the MRU end.',
      'When size exceeds capacity, the entry at the LRU end is exactly the one to evict. A JavaScript Map already preserves insertion order, so delete + re-set renews recency — or use an explicit hashmap + doubly linked list.',
    ],
    steps: [
      'get(key): miss → return -1. Hit → delete the key and re-insert it so it becomes the newest, then return its value.',
      'put(key,value): if the key exists, delete it first.',
      'Insert key at the most-recently-used end.',
      'If size now exceeds capacity, delete the least-recently-used entry (the oldest).',
    ],
    complexity: {
      time: 'O(1) average for both get and put.',
      space: 'O(capacity) for the stored entries.',
    },
    Visualizer: LRUCacheViz,
    code: LRU_MAP,
    solutions: [
      {
        name: '1 · Ordered Map (concise)',
        blurb:
          'Exploit insertion-ordered maps: delete + re-set renews a key as newest, and the first key is always the LRU to evict. This is the version animated above.',
        code: LRU_MAP,
      },
      {
        name: '2 · HashMap + Doubly Linked List (classic)',
        blurb:
          'The textbook design: a hashmap from key to a node in a doubly linked list with head (MRU) and tail (LRU) sentinels. Unlink and re-link nodes in O(1). This is what the ordered-map trick does under the hood.',
        code: LRU_DLL,
      },
    ],
  },

  {
    slug: 'trie',
    category: 'tries',
    title: 'Implement Trie (Prefix Tree)',
    difficulty: 'Medium',
    blurb: 'A tree of characters for O(L) word and prefix lookups.',
    tags: ['LeetCode 208', 'Trie', 'Design'],
    statement:
      'Implement a trie (prefix tree) supporting three operations: insert(word) adds a word; search(word) returns true only if the exact word was inserted; startsWith(prefix) returns true if any inserted word begins with the prefix.',
    intuition: [
      'A trie is a tree where every edge is labelled with a character, so a path from the root spells out a prefix. Words that share a prefix share the same branch — no duplication.',
      'insert walks the word character by character, creating a child node whenever the branch does not exist yet, then flags the final node as the end of a word.',
      'search walks the same way; if any character has no branch it fails, and at the end it checks the end-of-word flag (a prefix alone is not a match).',
      'startsWith is search without the final flag check: reaching the end of the prefix is enough.',
    ],
    steps: [
      'Keep a root node whose children are keyed by character; each node has an “end of word” flag.',
      'insert: for each char, follow or create the child; mark the last node as a word end.',
      'search: for each char, fail if the child is missing; at the end return the end flag.',
      'startsWith: same walk, but return true as soon as the whole prefix is consumed.',
    ],
    complexity: {
      time: 'O(L) per operation, where L is the length of the word or prefix.',
      space: 'O(total characters inserted) across all words.',
    },
    Visualizer: TrieViz,
    code: TRIE_CODE,
  },

  {
    slug: 'word-search',
    category: 'backtracking',
    title: 'Word Search',
    difficulty: 'Medium',
    blurb: 'Trace a word through a grid of letters using DFS with backtracking.',
    tags: ['LeetCode 79', 'Backtracking', 'DFS', 'Matrix'],
    statement:
      'Given an m × n grid of characters and a word, return true if the word exists in the grid. The word is built from letters of sequentially adjacent cells (horizontally or vertically neighbouring); the same cell may not be used more than once in a single path.',
    intuition: [
      'Any cell could be the first letter, so try starting a depth-first search from every cell.',
      'From a cell, the DFS matches word[i] here, then recurses into the four neighbours looking for word[i+1] — a classic “try a choice, recurse, undo” backtracking shape.',
      'To stop a path from reusing a cell, temporarily overwrite it (e.g. with “#”) before recursing, then restore it afterwards. That restore is the backtrack.',
      'A branch dies on three conditions: you run off the grid, the letter does not match, or the cell is already in the current path. If any neighbour reaches the end of the word, the answer is true.',
    ],
    steps: [
      'For each cell, start a DFS with index i = 0.',
      'In dfs(r, c, i): if i equals the word length, the whole word matched → true.',
      'Fail if out of bounds, or the cell does not equal word[i].',
      'Mark the cell used, recurse into all four neighbours for i + 1, then restore the cell (backtrack).',
      'Return true if any start cell’s DFS succeeds; otherwise false.',
    ],
    complexity: {
      time: 'O(m · n · 4^L) worst case, where L is the word length (each step branches into ~4 directions).',
      space: 'O(L) for the recursion stack (plus in-place marking, no extra grid).',
    },
    Visualizer: WordSearchViz,
    code: WORD_SEARCH,
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
    slug: 'clone-graph',
    category: 'graphs',
    title: 'Clone Graph',
    difficulty: 'Medium',
    blurb: 'Make a deep copy of an undirected graph — every node and edge duplicated.',
    tags: ['LeetCode 133', 'BFS', 'DFS', 'Hash Map'],
    statement:
      'You are given a reference to a node in a connected undirected graph. Each node has a value and a list of its neighbors. Return a deep copy (clone) of the graph: a brand-new set of nodes that has the same values and the same connections, sharing nothing with the original.',
    intuition: [
      'The hard part is not copying values — it is copying the edges without getting stuck in cycles. If you blindly follow neighbours you will clone the same node again and again forever.',
      'Keep a map from each ORIGINAL node to its NEW copy. Before you ever follow a node’s edges, put its copy in the map. That way every node is created exactly once.',
      'Walk the graph (BFS with a queue, or DFS with recursion). For each node you visit, look at its neighbours: clone any neighbour you have not seen, then wire the copy’s edge to the neighbour’s copy.',
      'Because the map is checked first, revisiting an already-cloned node just reuses its copy instead of making a new one — that is what tames the cycles.',
    ],
    steps: [
      'If the input node is null, return null.',
      'Create the start node’s copy and put original → copy in a map; seed the queue (BFS) with the start node.',
      'Pop a node. For each neighbour: if it is not in the map, clone it and enqueue it.',
      'Connect the current node’s copy to the neighbour’s copy (rebuilding the edge).',
      'Repeat until the queue is empty, then return the copy of the start node.',
    ],
    complexity: {
      time: 'O(V + E) — each node and edge is visited once.',
      space: 'O(V) for the map and the queue (or recursion stack).',
    },
    Visualizer: CloneGraphViz,
    code: CLONE_BFS,
    solutions: [
      {
        name: '1 · BFS — queue + map',
        blurb:
          'Clone the start node, then process the queue: for each node, clone any unseen neighbour, enqueue it, and link the copies. This is the version animated above.',
        code: CLONE_BFS,
      },
      {
        name: '2 · DFS — recursion + map',
        blurb:
          'Recurse from the start node. Record a node’s copy in the map BEFORE recursing into its neighbours so cycles resolve to the existing copy instead of looping forever.',
        code: CLONE_DFS,
      },
    ],
  },

  {
    slug: 'k-closest-points',
    category: 'heap',
    title: 'K Closest Points to Origin',
    difficulty: 'Medium',
    blurb: 'Return the k points nearest to (0,0) — by sorting or with a size-k max-heap.',
    tags: ['LeetCode 973', 'Heap', 'Sorting', 'QuickSelect'],
    statement:
      'Given an array of points where points[i] = [xi, yi] on the plane and an integer k, return the k points closest to the origin (0, 0). The distance between two points is the Euclidean distance. You may return the answer in any order.',
    intuition: [
      'Closeness is measured by distance to the origin, √(x² + y²). Since the square root is increasing, comparing the squared distance x² + y² gives the same ordering — and avoids floating-point math.',
      'Simplest approach: compute every squared distance, sort the points by it, and take the first k. That is O(n log n) — easy and often fast enough.',
      'When n is huge but k is small, you do not need a full sort. Keep a max-heap of only the k best seen so far: the farthest of your current keepers sits on top.',
      'For each new point, push it; if the heap now holds more than k, pop the top (the farthest). Whatever stays is the k closest — in O(n log k) time and O(k) space.',
    ],
    steps: [
      'Compute each point’s squared distance d = x² + y² to the origin.',
      'Sorting: sort all points by d ascending and return the first k.',
      'Heap: push each point onto a max-heap keyed by d.',
      'If the heap grows past size k, pop the top (the farthest point).',
      'After all points, the heap (or the first k of the sorted list) holds the answer.',
    ],
    complexity: {
      time: 'Sort: O(n log n). Heap: O(n log k) — better when k ≪ n. (QuickSelect: O(n) average.)',
      space: 'Sort: O(n) for the keys. Heap: O(k).',
    },
    Visualizer: KClosestPointsViz,
    code: KCLOSEST_HEAP,
    solutions: [
      {
        name: '1 · Sort by distance — O(n log n)',
        blurb:
          'Pair each point with its squared distance, sort ascending, and take the first k. The shortest code; great default.',
        code: KCLOSEST_SORT,
      },
      {
        name: '2 · Max-heap of size k — O(n log k)',
        blurb:
          'Hold only the k best seen so far. Push each point; if the heap exceeds k, pop the farthest. Faster than sorting when k is much smaller than n.',
        code: KCLOSEST_HEAP,
      },
    ],
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

// When each algorithm was first published (ISO, from git history). Used to surface
// the newest ones on the home page. Add a line when you add an algorithm; any slug
// missing here simply sorts as oldest.
const ADDED: Record<string, string> = {
  'redundant-connection': '2026-06-20T20:20:33Z',
  'climbing-stairs': '2026-06-20T20:20:34Z',
  'two-sum': '2026-06-21T13:54:40Z',
  'group-anagrams': '2026-06-21T14:03:09Z',
  'valid-parentheses': '2026-06-21T14:16:24Z',
  'number-of-islands': '2026-06-21T14:38:29Z',
  'binary-tree-level-order': '2026-06-21T14:50:36Z',
  'lowest-common-ancestor': '2026-06-21T15:25:32Z',
  'top-k-frequent': '2026-06-21T16:34:27Z',
  'merge-intervals': '2026-06-21T16:50:02Z',
  'course-schedule': '2026-06-21T21:52:42Z',
  'clone-graph': '2026-06-21T22:32:34Z',
  'k-closest-points': '2026-06-21T23:35:50Z',
  'product-except-self': '2026-06-21T23:48:22Z',
  'longest-substring': '2026-06-22T00:00:32Z',
  'meeting-rooms': '2026-06-22T00:15:16Z',
  'lru-cache': '2026-06-22T00:42:42Z',
  trie: '2026-06-22T00:50:00Z',
  'word-search': '2026-06-22T00:57:40Z',
  'container-with-most-water': '2026-07-11T10:00:00Z',
  'three-sum': '2026-07-11T10:10:00Z',
  'trapping-rain-water': '2026-07-11T10:20:00Z',
  'character-replacement': '2026-07-11T10:30:00Z',
}

// Newest algorithms first (by publish date), for the home page.
export function getLatestAlgorithms(n = 3): Algorithm[] {
  return [...ALGORITHMS]
    .sort((a, b) => (ADDED[b.slug] ?? '').localeCompare(ADDED[a.slug] ?? ''))
    .slice(0, n)
}
