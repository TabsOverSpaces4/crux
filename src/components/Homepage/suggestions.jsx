import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Star,
  Clock,
  BookOpen,
  User,
  Calendar,
  ExternalLink,
} from "lucide-react";

import { useLocation } from "react-router-dom";

function BookRecommendations() {
  const location = useLocation();
  const bookTitles = location.state?.books || [];
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper function to extract themes - MOVE THIS BEFORE fetchBooks
  const extractThemes = (categories, description) => {
    const themes = [];

    // Add categories as themes
    if (categories && categories.length > 0) {
      categories.forEach((category) => {
        // Clean up category names
        const cleanCategory = category.replace(
          /^(Fiction|Non-Fiction)\s*\/\s*/,
          ""
        );
        themes.push(cleanCategory);
      });
    }

    // Extract common themes from description
    if (description) {
      const commonThemes = [
        "Love",
        "Romance",
        "Adventure",
        "Mystery",
        "Science",
        "History",
        "Family",
        "Friendship",
        "War",
        "Politics",
        "Religion",
        "Philosophy",
        "Coming of Age",
        "Survival",
        "Magic",
        "Technology",
        "Drama",
        "Comedy",
        "Tragedy",
        "Alienation",
        "Identity",
        "Society",
      ];

      const descLower = description.toLowerCase();
      commonThemes.forEach((theme) => {
        if (
          descLower.includes(theme.toLowerCase()) &&
          !themes.some((t) => t.toLowerCase().includes(theme.toLowerCase()))
        ) {
          themes.push(theme);
        }
      });
    }

    return themes.length > 0 ? themes.slice(0, 4) : ["General"];
  };

  // Fetch books function
  const fetchBooks = async (bookTitles) => {
    setLoading(true);

    try {
      const results = await Promise.all(
        bookTitles.map(async (title) => {
          try {
            const response = await fetch(
              `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
                title
              )}&maxResults=1`
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const bookItem = data.items?.[0];

            if (!bookItem) {
              console.warn(`No results found for: ${title}`);
              return null;
            }

            // Extract data from the API response structure
            const volumeInfo = bookItem.volumeInfo;
            const saleInfo = bookItem.saleInfo;

            return {
              id: bookItem.id,
              title: volumeInfo.title || title,
              subtitle: volumeInfo.subtitle || "",
              author: volumeInfo.authors?.join(", ") || "Unknown Author",
              year: volumeInfo.publishedDate
                ? new Date(volumeInfo.publishedDate).getFullYear()
                : "Unknown",
              cover:
                volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") ||
                volumeInfo.imageLinks?.smallThumbnail?.replace(
                  "http:",
                  "https:"
                ) ||
                "https://via.placeholder.com/128x192/D8D2C2/4A4947?text=No+Cover",
              rating:
                volumeInfo.averageRating ||
                (Math.random() * 2 + 3.5).toFixed(1),
              pages: volumeInfo.pageCount || 200,
              genre: volumeInfo.categories || ["Fiction"],
              description: volumeInfo.description
                ? volumeInfo.description.length > 150
                  ? volumeInfo.description.substring(0, 150) + "..."
                  : volumeInfo.description
                : "No description available.",
              longDescription:
                volumeInfo.description || "No detailed description available.",
              themes: extractThemes(
                volumeInfo.categories,
                volumeInfo.description
              ),

              // Additional data from the API
              publisher: volumeInfo.publisher || "Unknown Publisher",
              publishedDate: volumeInfo.publishedDate || "Unknown",
              isbn:
                volumeInfo.industryIdentifiers?.find(
                  (id) => id.type === "ISBN_13" || id.type === "ISBN_10"
                )?.identifier || "",
              language: volumeInfo.language || "en",
              pageCount: volumeInfo.pageCount,
              printType: volumeInfo.printType || "BOOK",
              maturityRating: volumeInfo.maturityRating || "NOT_MATURE",

              // Links
              previewLink:
                volumeInfo.previewLink?.replace("http:", "https:") || "",
              infoLink: volumeInfo.infoLink?.replace("http:", "https:") || "",
              canonicalVolumeLink:
                volumeInfo.canonicalVolumeLink?.replace("http:", "https:") ||
                "",

              // Sale information
              saleability: saleInfo?.saleability || "NOT_FOR_SALE",
              isEbook: saleInfo?.isEbook || false,
              buyLink: saleInfo?.buyLink?.replace("http:", "https:") || "",
              price: saleInfo?.listPrice
                ? {
                    amount: saleInfo.listPrice.amount,
                    currencyCode: saleInfo.listPrice.currencyCode,
                  }
                : null,

              // Access information
              webReaderLink:
                bookItem.accessInfo?.webReaderLink?.replace(
                  "http:",
                  "https:"
                ) || "",
              textSnippet: bookItem.searchInfo?.textSnippet || "",
            };
          } catch (error) {
            console.error(`Error fetching data for "${title}":`, error);
            // Return a fallback object for failed requests
            return {
              id: Math.random().toString(36).substr(2, 9),
              title: title,
              subtitle: "",
              author: "Unknown Author",
              year: "Unknown",
              cover:
                "https://via.placeholder.com/128x192/D8D2C2/4A4947?text=No+Cover",
              rating: (Math.random() * 2 + 3.5).toFixed(1),
              pages: 200,
              genre: ["Fiction"],
              description: "Book information could not be retrieved.",
              longDescription:
                "Book information could not be retrieved from Google Books API.",
              themes: ["General"],
              publisher: "Unknown Publisher",
              publishedDate: "Unknown",
              isbn: "",
              language: "en",
              previewLink: "",
              infoLink: "",
              buyLink: "",
              price: null,
            };
          }
        })
      );

      // Filter out null results and set the recommended books
      const validBooks = results.filter((book) => book !== null);
      setBooks(validBooks);
      console.log("Fetched books:", validBooks);

      return validBooks;
    } catch (error) {
      console.error("Error in fetchBooks:", error);
      alert("Error fetching book recommendations. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch books when component mounts
  useEffect(() => {
    if (bookTitles.length > 0) {
      fetchBooks(bookTitles);
    }
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div
        className="w-full min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FAF7F0" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#B17457" }}
          ></div>
          <p style={{ color: "#4A4947" }}>
            Fetching your book recommendations...
          </p>
        </div>
      </div>
    );
  }

  const openModal = (book) => {
    setSelectedBook(book);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedBook(null);
    document.body.style.overflow = "unset";
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes backdropFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(8px);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-modal-fade-in {
          animation: modalFadeIn 0.3s ease-out forwards;
        }

        .animate-backdrop-fade-in {
          animation: backdropFadeIn 0.3s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }

        .book-card {
          transition: all 0.3s ease;
          background: #f8f6f0;
          border: 1px solid #d4c4a8;
        }
        .book-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
        .book-cover {
          transition: all 0.3s ease;
        }
        .book-card:hover .book-cover {
          transform: scale(1.03);
        }
        .vintage-text {
          font-family: 'Georgia', serif;
        }
      `}</style>

      <div
        className="w-full min-h-screen"
        style={{ backgroundColor: "#FAF7F0" }}
      >
        {/* Header Section */}
        <div className="w-full py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8 flex justify-center animate-fade-in-up">
              <div
                className="p-4 rounded-full transform transition-all duration-500 hover:scale-110 hover:rotate-12"
                style={{ backgroundColor: "#D8D2C2" }}
              >
                <BookOpen className="w-12 h-12" style={{ color: "#4A4947" }} />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight animate-fade-in-up">
              <span style={{ color: "#4A4947" }}>Here are some </span>
              <span
                className="inline-block bg-gradient-to-r bg-clip-text text-transparent animate-shimmer"
                style={{
                  backgroundImage: `linear-gradient(90deg, #B17457, #4A4947, #B17457)`,
                  backgroundSize: "200% 100%",
                }}
              >
                suggestions
              </span>
            </h1>

            <p
              className="text-xl mb-12 max-w-2xl mx-auto opacity-80 animate-fade-in-up animation-delay-200"
              style={{ color: "#4A4947" }}
            >
              Curated recommendations based on your reading preferences
            </p>
          </div>
        </div>

        {/* Books Grid */}
        <div className="w-full pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book, index) => (
                <Card
                  className="book-card cursor-pointer shadow-2xl overflow-hidden max-w-sm w-full rounded-2xl leather-texture animate-float"
                  onClick={() => openModal(book)}
                >
                  <CardContent className="p-0">
                    {/* Book Cover Container */}
                    <div className="relative p-6 flex justify-center">
                      <div
                        className="book-cover w-44 h-60 rounded-lg overflow-hidden shadow-md"
                        style={{ border: "2px solid #c4a574" }}
                      >
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-8 right-8">
                        <div
                          className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm"
                          style={{ border: "1px solid #c4a574" }}
                        >
                          <Star
                            className="w-4 h-4 mr-1"
                            fill="#c4a574"
                            style={{ color: "#c4a574" }}
                          />
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#6b5b47" }}
                          >
                            {book.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Book Information */}
                    <div className="p-6 space-y-4">
                      {/* Title */}
                      <h3
                        className="text-xl font-bold leading-tight vintage-text text-center"
                        style={{ color: "#4a3c2a" }}
                      >
                        {book.title}
                      </h3>

                      {/* Author */}
                      <div className="flex items-center justify-center">
                        <User
                          className="w-4 h-4 mr-2"
                          style={{ color: "#8b7355" }}
                        />
                        <span
                          className="text-base font-medium vintage-text"
                          style={{ color: "#6b5b47" }}
                        >
                          {book.author}
                        </span>
                      </div>

                      {/* Publication Info */}
                      <div className="flex items-center justify-between text-sm py-3">
                        <div className="flex items-center">
                          <Calendar
                            className="w-4 h-4 mr-2"
                            style={{ color: "#8b7355" }}
                          />
                          <span
                            className="vintage-text"
                            style={{ color: "#6b5b47" }}
                          >
                            {book.year}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock
                            className="w-4 h-4 mr-2"
                            style={{ color: "#8b7355" }}
                          />
                          <span
                            className="vintage-text"
                            style={{ color: "#6b5b47" }}
                          >
                            {book.pages} pages
                          </span>
                        </div>
                      </div>

                      {/* Genres */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {book.genre.slice(0, 3).map((g, index) => (
                          <Badge
                            key={g}
                            className="text-xs px-3 py-1 rounded-full font-medium vintage-text"
                            style={{
                              border: "1px solid #c4a574",
                              color: "#6b5b47",
                              backgroundColor: "#faf9f7",
                            }}
                          >
                            {g}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        {selectedBook && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-backdrop-fade-in"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={closeModal}
          >
            <div
              className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-modal-fade-in"
              style={{ backgroundColor: "#FAF7F0" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200 hover:scale-110"
                style={{ backgroundColor: "#D8D2C2" }}
              >
                <X className="w-5 h-5" style={{ color: "#4A4947" }} />
              </button>

              <div className="flex flex-col lg:flex-row">
                {/* Book Cover */}
                <div className="lg:w-1/3 p-8">
                  <div className="relative">
                    <img
                      src={selectedBook.cover}
                      alt={selectedBook.title}
                      className="w-full h-80 lg:h-96 object-cover rounded-lg shadow-lg"
                    />
                    <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                      <div className="flex items-center">
                        <Star
                          className="w-5 h-5 text-yellow-500 mr-1"
                          fill="currentColor"
                        />
                        <span className="font-bold text-lg">
                          {selectedBook.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Details */}
                <div className="lg:w-2/3 p-8">
                  <h2
                    className="text-3xl font-bold mb-4 leading-tight"
                    style={{ color: "#4A4947" }}
                  >
                    {selectedBook.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="flex items-center">
                      <User
                        className="w-5 h-5 mr-2"
                        style={{ color: "#B17457" }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: "#4A4947" }}
                      >
                        {selectedBook.author}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar
                        className="w-5 h-5 mr-2"
                        style={{ color: "#B17457" }}
                      />
                      <span style={{ color: "#4A4947" }}>
                        {selectedBook.year}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock
                        className="w-5 h-5 mr-2"
                        style={{ color: "#B17457" }}
                      />
                      <span style={{ color: "#4A4947" }}>
                        {selectedBook.pages} pages
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: "#4A4947" }}
                    >
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBook.genre.map((g) => (
                        <Badge
                          key={g}
                          className="text-white px-3 py-1"
                          style={{ backgroundColor: "#B17457" }}
                        >
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: "#4A4947" }}
                    >
                      Description
                    </h3>
                    <p
                      className="text-base leading-relaxed mb-4"
                      style={{ color: "#4A4947" }}
                    >
                      {selectedBook.longDescription}
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: "#4A4947" }}
                    >
                      Key Themes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBook.themes.map((theme) => (
                        <Badge
                          key={theme}
                          variant="outline"
                          className="px-3 py-1"
                          style={{
                            borderColor: "#B17457",
                            color: "#4A4947",
                            backgroundColor: "transparent",
                          }}
                        >
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      className="text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      style={{ backgroundColor: "#B17457" }}
                    >
                      <ExternalLink className="mr-2 w-4 h-4" />
                      Find This Book
                    </Button>
                    <Button
                      variant="outline"
                      className="px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105"
                      style={{
                        borderColor: "#B17457",
                        color: "#4A4947",
                        backgroundColor: "transparent",
                      }}
                      onClick={closeModal}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BookRecommendations;
