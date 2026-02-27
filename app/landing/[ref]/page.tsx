export default async function LandingPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  return (
    <main>
      <div>{ref}</div>
    </main>
  )
}
