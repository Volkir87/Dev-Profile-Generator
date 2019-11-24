# Dev-Profile-Generator

A backend developer profile generator

A backend application, which will generate a pdf containing basic information about a given developer.

The application is run from the command line. When executed, an application will request a user to input a developer name (login as per GitHub) and a color (form a list of available colors).

The application will then call GitHub API to obtain the basic information abouth a developer, and put the results into HTML, which will then be printed and saved as a PDF file. 

![result](assets/screenshots/generated_pdf.PNG)