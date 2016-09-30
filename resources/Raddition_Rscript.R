library(argparser, quietly=TRUE)

# Create a parser
p <- arg_parser("Add two numbers")

# Add command line arguments
p <- add_argument(p, "x", help="first number", type="numeric")
p <- add_argument(p, "y", help="second number", type="numeric")

# Parse the command line arguments
argv <- parse_args(p)

# Do work based on the passed arguments
cat(argv$x+argv$y)
