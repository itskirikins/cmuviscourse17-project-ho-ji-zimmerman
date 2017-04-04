# Visualization in HCI Project Proposal

**Title** *(tentative)*: **Post-grads Chasing the American Dream**

Audasia Ho (audasiah), Elizabeth Ji (emji), Jake Zimmerman (jezimmer)

[Project Repo](https://github.com/itskirikins/cmuviscourse17-project-ho-ji-zimmerman)

# Background & Motivation

As a child, I asked my father “What *is* the American Dream?” He was quick to
respond: “It’s that everyone be able to grow up, own a house, start a family,
and be happy.” It was only later that I learned of the canonical definition by
James Truslow Adams: “life should be better and richer and fuller for everyone,
with opportunity for each according to ability or achievement.” While maybe not
the entire picture, home ownership is a large part of attaining the American
Dream for many people.

As college students about to graduate, thinking about our own future potentials,
we got to thinking about others like us. Earning potential post-graduation is
intimately tied to area of study in college. Given the earning potentials for
college majors around the country, where in the United States can they afford a
home?

As a stepping stone to home ownership, most graduates choose to rent immediately
after graduating, while saving for the future. We’ll investigate how earning
potential interact with rental prices to understand where college graduates can
afford to live.

# Project Objectives

Our primary aim is to explore the relation between what people choose to study
in college and where they may be able to live after graduation. This will be
accomplished by exploring two relations; one is how college major affects median
salary and the other is how expensive renting is in different parts of the US.
By combining these datasets, we can show how a student’s choices impacts their
future. Some benefits include students being able to better understand where
they afford to live, how much of their salary they will be spending on their
rent, and possibly how other choices (how many roommates, how many bedrooms,
etc.) can impact their cost of rent.

# Data

We will be using FiveThirtyEight’s dataset of earnings based on [college
major](https://github.com/fivethirtyeight/data/tree/master/college-majors) to
understand the relationship between college majors or industries and their
median starting salary. We will be using [Zillow’s rental data
set](https://www.zillow.com/research/data/#rental-data) to understand the cost
of renting in various locations. FiveThirtyEight and Zillow have produced this
information in the anticipation that people will use it, and the data reflects
this: a cursory scan reveals that it’s well–structured.

Of course, this is a double edged sword. These data sets contain vastly more
information than we’ care to analyze. A preliminary step will involve munging
the data into a simpler format. We’ll remove columns we don’t need, filter the
data to be suitably well scoped, and generally collect the data in an
easy-to-parse format.

# Visualization Design

We have decided to have at least 3 views for our project. We wanted to first
visualize our data sets independently of each other, in order to have viewers
understand each on their own. After this, we want to create an interactive view
that allows viewers to see which majors can afford housing where. We think that
this is an effective way of communicating the data as it allows viewers to
explore and compare different college majors.

**View 1: Median Salaries Across Different College Majors** This view displays
the median salaries of different college majors. We first group them
industry/categories of interest and then allow viewers to dive deeper into a
category or just see top/bottom 20 majors.

Prototype Sketches:

![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490170032799_Screen+Shot+2017-03-22+at+4.06.40+AM.png)
![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490170542625_Screen+Shot+2017-03-22+at+4.15.25+AM.png)
![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490170032788_Screen+Shot+2017-03-22+at+4.06.15+AM.png)
![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490170032774_Screen+Shot+2017-03-22+at+4.05.54+AM.png)


Final Sketch:

![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490170082126_Screen+Shot+2017-03-22+at+4.06.06+AM.png)

Our final design for this view is a horizontal bar graph that displays majors in
one industry or category at a time. The majors and their salaries are listed in
descending order. Some of our initial designs were simple vertical bar graphs or
circles with varying sizes. Since there were a large number of majors we wanted
to include, we then considered displaying salaries by industry and having some
sort of transition to a display showing majors in that industry. However, we
realized that this would require us to calculate median salaries for each
industry, which was something we felt we could not do with enough accuracy.  We
eliminated viewing salary by industry and instead chose a drop down menu to
select industry. This also lets us explore other potential areas of interest,
such as the 25 highest earning or lowest earning majors. The encoding as a bar
graph sorted from highest to lowest makes comparisons between the majors
pictured easy to understand, while the selector allows exploration of different
areas.

**View 2: Map of Rental Costs in the US** This view displays a map of the United
States with a color scale of the different rent prices in different areas of the
US. When a user mouses over a region a tooltip will display the median rent
price in that region.

Sketches:

![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490170572436_Screen+Shot+2017-03-22+at+4.14.30+AM.png)
![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490170560931_Screen+Shot+2017-03-22+at+4.14.54+AM.png)


Our design for this view is a map of the United States with areas colored
according to the median rent price in that region. When hovering over a specific
location, a box showing the median rent will appear. We also had ideas of
distorting the areas according to how high the rent was, but decided that color
would be easier to see and understand. There was not much prototyping with this
view, as a map was the clearest way to show a relation between the location and
the price.

**View 3: Interactive Map of Rental Costs and College Salaries** This view is an
interactive view that allows the user to either click on college majors or click
on regions on the map. Clicking on a college major will highlight on the map
what areas are affordable for that major. Clicking on a region on the map will
list all the college majors that can afford to live there.

Prototype Sketches:

![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490170921276_Screen+Shot+2017-03-22+at+4.21.33+AM.png)


Final Sketch:

![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490170945459_Screen+Shot+2017-03-22+at+4.20.54+AM.png)
![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490170921267_Screen+Shot+2017-03-22+at+4.20.39+AM.png)


Our final design is a map with two possibilities for interaction. By clicking on
a specific location, an overlay will appear displaying which majors can afford
to live in that location. By using the selectors at the top of the map to pick a
major, number of roommates, and number of bedrooms, the map will display which
areas are affordable. We will either pick some fixed percentage of the median
income to define affordable, or we may display a range of percentages with a
color scale. We decided against displaying the major selection to the side to
avoid clutter as well as wasted space if the user was viewing a specific area
instead of choosing a major. Because the data we want to show is location based,
we again decided that a colored map would be best to show this.

**Website Sketches:**

![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490171018179_Screen+Shot+2017-03-22+at+4.23.27+AM.png)
![](https://d2mxuefqeaa7sj.cloudfront.net/s_DB4D4AACAC0E1B0D37CF1D3F82A1855B5E8C024656C12F5ACD89D9A47496D872_1490171018160_Screen+Shot+2017-03-22+at+4.23.22+AM.png)

# Features

## Must-Have

- Graph of median salaries based on major
- Map of US labelled with different rental home prices
- Interactive view allowing user to see what majors can afford housing where

## Optional

- Ability to change what houses are affordable based on number of roommates
  and/or number of bedrooms
- Estimate a person’s salary over the next 10 years to see if they can buy a
  house
- Ability for user to input own information to see where they can afford housing
- Show percentage of salary that rent costs in each location

# Schedule

- **Mon, March 27**
    - Finalize design for visualizations
        - *team*
    - Finish processing data
        - Jake, Liz
    - Set up project repo and add bare skeleton files
        - Audi

- **Mon, April 3**
    - Bare bones skeleton of website that will house our visualization
        - Jake
    - Salary visualization done
        - Liz
    - Rent in the US visualization done
        - Audi
    - Start working on interactive map/salary view
        - Jake

- **Mon, April 10**
    - Draft process book
        - *team*
    - Make sure all in-progress code is pushed
        - *team*

- **Mon, April 17**
    - Complete interactive views for the college majors salaries/what rent they
      can afford visualizations
        - Jake
    - Finalize web design for website
        - Liz
    - Update process book
        - Audi

- **Mon, April 24**
    - Finish putting all visualizations in website, make sure website looks good
        - Jake
    - Create project screencast now that website and visualizations are done
        - Audi, Liz
    - Work on final presentation
        - *team*

- **Mon, May 3**
    - Make sure all code is uploaded and website is online


