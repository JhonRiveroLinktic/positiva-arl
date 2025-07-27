type Props = {
  title: string;
  description: string;
}

export function Banner({ title, description }: Props) {
  return (
    <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-xl p-8 w-full text-white shadow-lg">
      <div className="w-full">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-orange-100 text-lg">
          {description}
        </p>
      </div>
    </div>
  )
}