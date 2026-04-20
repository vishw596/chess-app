const LegalMoveIndicator = ({
  isPiece,
  isMainBoxColor,
}: {
  isPiece: boolean;
  isMainBoxColor: boolean;
}) => {
  return (
    <div className="absolute z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      {isPiece ? (
        <div
          className={`h-[60px] w-[60px] rounded-full border-4 ${isMainBoxColor ? 'border-white/55' : 'border-black/35'}`}
        />
      ) : (
        <div
          className={`h-5 w-5 rounded-full ${isMainBoxColor ? 'bg-white/40' : 'bg-black/25'}`}
        />
      )}
    </div>
  );
};

export default LegalMoveIndicator;
