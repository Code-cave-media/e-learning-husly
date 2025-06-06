using System;

namespace WordAscii
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Enter a sentence:");
            string input = Console.ReadLine();

            string[] words = GetWords(input); // custom function (no .Split())
            int[] asciiValues = new int[words.Length];

            Console.WriteLine("\nWords and their ASCII values:\n");
            for (int i = 0; i < words.Length; i++)
            {
                asciiValues[i] = CalculateAscii(words[i]);
                Console.WriteLine("Word {0}: {1} = {2}", i + 1, words[i], asciiValues[i]);
            }

            Console.WriteLine("\nPress Enter to show sister words...");
            Console.ReadLine();

            ShowSisterWords(words, asciiValues);
        }

        // Function to extract words manually (no Split used)
        static string[] GetWords(string text)
        {
            string currentWord = "";
            string[] temp = new string[100]; // assuming max 100 words
            int wordCount = 0;

            for (int i = 0; i < text.Length; i++)
            {
                char ch = text[i];
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'))
                {
                    currentWord += ch;
                }
                else
                {
                    if (currentWord.Length > 0)
                    {
                        temp[wordCount] = currentWord;
                        wordCount++;
                        currentWord = "";
                    }
                }
            }

            // Last word
            if (currentWord.Length > 0)
            {
                temp[wordCount] = currentWord;
                wordCount++;
            }

            // Resize array to actual word count
            string[] words = new string[wordCount];
            for (int i = 0; i < wordCount; i++)
            {
                words[i] = temp[i];
            }

            return words;
        }

        // Function to calculate ASCII value of a word
        static int CalculateAscii(string word)
        {
            int total = 0;
            for (int i = 0; i < word.Length; i++)
            {
                total += (int)word[i];
            }
            return total;
        }

        // Function to show sister words
        static void ShowSisterWords(string[] words, int[] asciiValues)
        {
            bool found = false;
            for (int i = 0; i < asciiValues.Length; i++)
            {
                for (int j = i + 1; j < asciiValues.Length; j++)
                {
                    if (asciiValues[i] == asciiValues[j])
                    {
                        Console.WriteLine("Sister Words Found:");
                        Console.WriteLine("Word {0}: {1}", i + 1, words[i]);
                        Console.WriteLine("Word {0}: {1}", j + 1, words[j]);
                        Console.WriteLine("ASCII Value: {0}\n", asciiValues[i]);
                        found = true;
                    }
                }
            }

            if (!found)
            {
                Console.WriteLine("No sister words found.");
            }
        }
    }
}