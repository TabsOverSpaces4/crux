import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, BookOpen, Sparkles, Search } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const genres = [
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Romance",
  "Thriller",
  "Literary Fiction",
  "Historical Fiction",
  "Non-fiction",
  "Biography",
  "Self-Help",
  "Philosophy",
  "Poetry",
  "Horror",
  "Adventure",
];

function Home() {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [readingLevel, setReadingLevel] = useState([5]);
  const [timeCommitment, setTimeCommitment] = useState([200]);
  const [favoriteBooks, setFavoriteBooks] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_API_KEY;;

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const scrollToForm = () => {
    document.getElementById("form-section").scrollIntoView({
      behavior: "smooth",
    });
  };

  const getReadingLevelText = (value) => {
    if (value <= 3) return "Beginner (rare reader, light reads)";
    if (value <= 7) return "Intermediate (comfortable with longer fiction)";
    return "Advanced (enjoys complex plots, prose, classics)";
  };

  const getTimeCommitmentText = (value) => {
    if (value <= 150) return `Quick reads (~${value} pages)`;
    if (value <= 300) return `Medium reads (~${value} pages)`;
    if (value <= 450) return `Long reads (~${value} pages)`;
    return `Epic reads (${value}+ pages)`;
  };

  // Gemini API prompt generator
  const generateGeminiPrompt = (userData) => {
    return `You are a professional book recommendation system. Based on the user's preferences, suggest exactly 5 books that match their criteria.

User Preferences:
- Preferred Genres: ${userData.selectedGenres.join(", ")}
- Reading Level: ${userData.readingLevel.description} (${
      userData.readingLevel.value
    }/10)
- Time Commitment: ${userData.timeCommitment.description}
- Favorite Books: ${userData.favoriteBooks}

Instructions:
1. Analyze the user's favorite books to understand their taste
2. Consider their preferred genres and reading level
3. Match the page count preference (${
      userData.timeCommitment.pages
    } pages approximately)
4. Provide exactly 5 book recommendations
5. Return ONLY the book titles separated by pipes, no other text or explanation

Example format: Book Title 1 | Book Title 2 | Book Title 3 | Book Title 4 | Book Title 5

Respond with only the pipe-separated book titles.`;
  };

  const extractBookTitles = (apiResponse) => {
    try {
      // Extract the text from the API response structure
      const generatedText = apiResponse.candidates[0].content.parts[0].text;
      
      // Clean the text and split by pipes
      const bookList = generatedText
        .trim() // Remove leading/trailing whitespace
        .replace(/\n/g, '') // Remove all newline characters
        .split('|') // Split by pipe character
        .map(book => book.trim()) // Trim whitespace from each title
        .filter(book => book.length > 0); // Remove empty strings
      
      // If we successfully got book titles, navigate to suggestions
      if (bookList.length > 0) {
        // You can pass the book list via state or store it in context/localStorage
        // Option 1: Pass via navigation state
        navigate('/suggestions', { state: { books: bookList } });
        
        // Option 2: Store in sessionStorage and navigate
        // sessionStorage.setItem('bookRecommendations', JSON.stringify(bookList));
        // navigate('/suggestions');
      }
      
      return bookList;
    } catch (error) {
      console.error('Error extracting book titles:', error);
      return [];
    }
  };
  const callGeminiAPI = async (userData) => {
    setLoading(true);
    try {
      const prompt = generateGeminiPrompt(userData);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Use the extraction function
      const bookList = extractBookTitles(data);
      
      if (bookList.length > 0) {
        setRecommendations(bookList);
        console.log('Extracted book titles:', bookList);
      } else {
        throw new Error('Could not extract book recommendations');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      alert('Error getting recommendations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleThinkForMe = () => {
    const userData = {
      selectedGenres: selectedGenres,
      readingLevel: {
        value: readingLevel[0],
        description: getReadingLevelText(readingLevel[0]),
      },
      timeCommitment: {
        pages: timeCommitment[0],
        description: getTimeCommitmentText(timeCommitment[0]),
      },
      favoriteBooks: favoriteBooks.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("User Data:", JSON.stringify(userData, null, 2));
    callGeminiAPI(userData);
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

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulseSubtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spinSlow 3s linear infinite;
        }

        .animate-pulse-subtle {
          animation: pulseSubtle 2s ease-in-out infinite;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }

        .animation-delay-700 {
          animation-delay: 0.7s;
          opacity: 0;
        }
      `}</style>
      <div
        className=" w-[100%] min-h-screen"
        style={{ backgroundColor: "#FAF7F0" }}
      >
        {/* Hero Section */}
        <div className="w-[100%] min-h-screen flex flex-col items-center justify-center relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 flex justify-center">
              <div
                className="p-4 rounded-full transform transition-all duration-500 hover:scale-110 hover:rotate-12 animate-pulse"
                style={{ backgroundColor: "#D8D2C2" }}
              >
                <BookOpen className="w-16 h-16" style={{ color: "#4A4947" }} />
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight animate-fade-in-up">
              <span
                className="inline-block transform transition-all duration-700 hover:scale-105"
                style={{ color: "#4A4947" }}
              >
                The
              </span>
              <span
                className="inline-block transform transition-all duration-700 hover:scale-105 bg-gradient-to-r bg-clip-text text-transparent animate-shimmer"
                style={{
                  backgroundImage: `linear-gradient(90deg, #B17457, #4A4947, #B17457)`,
                  backgroundSize: "200% 100%",
                }}
              >
                Crux
              </span>
            </h1>

            <p
              className="text-2xl md:text-3xl mb-4 font-light animate-fade-in-up animation-delay-300"
              style={{ color: "#4A4947" }}
            >
              AI-Powered Book Search
            </p>

            <p
              className="text-lg mb-12 max-w-2xl mx-auto opacity-80 animate-fade-in-up animation-delay-500"
              style={{ color: "#4A4947" }}
            >
              Discover your next favorite book with intelligent recommendations
              tailored to your reading preferences and habits.
            </p>

            <Button
              onClick={scrollToForm}
              size="lg"
              className="text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 animate-fade-in-up animation-delay-700 relative overflow-hidden group"
              style={{ backgroundColor: "#B17457" }}
            >
              <span className="relative z-10 flex items-center">
                Get Started
                <Sparkles className="ml-2 w-5 h-5 animate-spin-slow group-hover:animate-ping" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-all duration-1000"></div>
            </Button>
          </div>

          {/* Scroll indicator */}
          <div
            className="absolute bottom-8 animate-bounce hover:animate-pulse cursor-pointer"
            onClick={scrollToForm}
          >
            <ChevronDown
              className="w-8 h-8 transition-all duration-300 hover:scale-125"
              style={{ color: "#B17457" }}
            />
          </div>
        </div>

        {/* Form Section */}
        <div id="form-section" className="w-full py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2
                className="text-4xl font-bold mb-4"
                style={{ color: "#4A4947" }}
              >
                Tell Us About Your Reading Style
              </h2>
              <p className="text-lg opacity-80" style={{ color: "#4A4947" }}>
                Help us understand your preferences to find the perfect books
                for you
              </p>
            </div>

            <Card
              className="shadow-2xl border-0 transform transition-all duration-700 hover:scale-[1.02] animate-fade-in-up animation-delay-300"
              style={{ backgroundColor: "#D8D2C2" }}
            >
              <CardContent className="p-8 space-y-8">
                {/* Genre Selection */}
                <div>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#4A4947" }}
                  >
                    What genres do you usually enjoy?
                  </h3>
                  <p
                    className="text-sm mb-4 opacity-70"
                    style={{ color: "#4A4947" }}
                  >
                    Select a few that interest you
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {genres.map((genre, index) => (
                      <Badge
                        key={genre}
                        variant={
                          selectedGenres.includes(genre) ? "default" : "outline"
                        }
                        className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 hover:scale-110 hover:-translate-y-1 animate-fade-in-up ${
                          selectedGenres.includes(genre)
                            ? "text-white shadow-lg transform scale-105"
                            : "hover:shadow-md"
                        }`}
                        style={{
                          backgroundColor: selectedGenres.includes(genre)
                            ? "#B17457"
                            : "transparent",
                          borderColor: "#B17457",
                          color: selectedGenres.includes(genre)
                            ? "white"
                            : "#4A4947",
                          animationDelay: `${index * 50}ms`,
                        }}
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Reading Level */}
                <div>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#4A4947" }}
                  >
                    How comfortable are you with dense books?
                  </h3>
                  <div className="space-y-4">
                    <Slider
                      value={readingLevel}
                      onValueChange={setReadingLevel}
                      max={10}
                      min={0}
                      step={0.1}
                      className="w-full transition-all duration-200 ease-out"
                    />
                    <div
                      className="flex justify-between text-sm opacity-70"
                      style={{ color: "#4A4947" }}
                    >
                      <span>0</span>
                      <span className="font-medium">
                        {getReadingLevelText(readingLevel[0])}
                      </span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                {/* Time Commitment */}
                <div>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#4A4947" }}
                  >
                    How much time do you want to commit to reading?
                  </h3>
                  <div className="space-y-4">
                    <Slider
                      value={timeCommitment}
                      onValueChange={setTimeCommitment}
                      max={500}
                      min={50}
                      step={10}
                      className="w-full transition-all duration-200 ease-out"
                    />
                    <div
                      className="flex justify-between text-sm opacity-70"
                      style={{ color: "#4A4947" }}
                    >
                      <span>50 pages</span>
                      <span className="font-medium">
                        {getTimeCommitmentText(timeCommitment[0])}
                      </span>
                      <span>500+ pages</span>
                    </div>
                  </div>
                </div>

                {/* Favorite Books */}
                <div>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#4A4947" }}
                  >
                    What are some books (or movies/shows) you've really liked?
                  </h3>
                  <p
                    className="text-sm mb-4 opacity-70"
                    style={{ color: "#4A4947" }}
                  >
                    Optional - This helps us understand your taste better
                  </p>
                  <Textarea
                    placeholder="e.g., Harry Potter series, The Office, Dune, Pride and Prejudice..."
                    value={favoriteBooks}
                    onChange={(e) => setFavoriteBooks(e.target.value)}
                    className="min-h-24 resize-none border-2 focus:ring-2"
                    style={{
                      borderColor: "#B17457",
                      backgroundColor: "#FAF7F0",
                    }}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6 text-center">
                  <Button
                    size="lg"
                    onClick={handleThinkForMe}
                    className="text-white text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 relative overflow-hidden group animate-pulse-subtle"
                    style={{ backgroundColor: "#B17457" }}
                  >
                    <span className="relative z-10 flex items-center">
                      <Search className="mr-2 w-5 h-5 group-hover:animate-spin transition-all duration-300" />
                      Think for me
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-all duration-1000"></div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
