interface Props {
  label: string;
}

export default function Component(props: Props) {
  return (
    <div className="flex-initial flex gap-x-2 select-none mt-12 mb-4 first:mt-0">
      <div className="flex-initial flex flex-col justify-center font-bold text-cyan-600 text-base">
        {props.label}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="h-0.5 bg-cyan-600" />
      </div>
    </div>
  );
}
