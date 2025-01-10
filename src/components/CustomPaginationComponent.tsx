interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageRange: { start: number; end: number };
  handlePageChange: (page: number) => void;
  handleNext: () => void;
  handlePrevious: () => void;
}

const CustomPaginationComponent: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageRange,
  handlePageChange,
  handleNext,
  handlePrevious,
}) => {
  return (
    <div className="flex justify-center items-center mt-6 flex-wrap gap-2">
      <button
        onClick={handlePrevious}
        disabled={pageRange.start <= 1}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-l-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      >
        Previous
      </button>

      {[...Array(pageRange.end - pageRange.start + 1)].map((_, index) => (
        <button
          key={pageRange.start + index}
          onClick={() => handlePageChange(pageRange.start + index)}
          className={`px-4 py-2 ${
            currentPage === pageRange.start + index
              ? "bg-blue-500 text-white dark:bg-blue-700"
              : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          } rounded-md hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600`}
        >
          {pageRange.start + index}
        </button>
      ))}

      <button
        onClick={handleNext}
        disabled={pageRange.end >= totalPages}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-r-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      >
        Next
      </button>
    </div>
  );
};

export default CustomPaginationComponent;
