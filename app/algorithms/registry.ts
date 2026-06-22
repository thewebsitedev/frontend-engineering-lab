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
