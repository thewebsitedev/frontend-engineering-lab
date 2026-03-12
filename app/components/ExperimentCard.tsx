import Link from "next/link"

export default function ExperimentCard({ title, href }) {
  return (
    <Link href={href}>
      <div className="border p-4 rounded-lg hover:shadow">
        <h3>{title}</h3>
      </div>
    </Link>
  )
}