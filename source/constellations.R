library(dplyr)
library(purrr)


url <- 'https://data.nasa.gov/data.json'
raw <- jsonlite::fromJSON(url)
datasets <- raw$dataset %>%
  select(description, distribution, issued, theme, keyword, landingPage, title) %>%
  mutate(
      accessURL = map(distribution, "accessURL", .null = ""),
      downloadURL = map(distribution, "downloadURL", .null = ""),
      url = paste(accessURL, downloadURL),
      theme = sapply(theme, paste0, collapse=";"),
      keyword = sapply(keyword, paste0, collapse=";"),
      description = trimws(description, which = "both")
  ) %>%
  select(description, issued, theme, keyword, title, url) %>%
  tidyr::separate_rows(theme, sep = ';')


## Starts are datasets which not share theme with other datasets
stars <- datasets %>%
  group_by(theme) %>%
  filter(max(row_number()) == 1) %>%
  ungroup() %>%
  group_by(title, issued, keyword, description, url) %>%
  summarise(theme = paste0(theme, collapse = ";")) %>%
  mutate(url = gsub("c\\(", "", url)) %>% # I don't know how url is a character 
  mutate(url = gsub("NA[,]?", "", url)) %>%
  mutate(url = gsub("\\)", "", url))
  
stars %>% jsonlite::toJSON(pretty=TRUE) %>%
  readr::write_lines('../app/data/stars.json')


## Constellations share theme
## We have to create the links between starts in constellations
constellations <- datasets %>%
  group_by(theme) %>%
  filter(max(row_number()) > 1) %>%
  ungroup() %>%
  group_by(title, issued, keyword, description, theme) %>%
  summarise(url = paste0(url, collapse = ";")) %>%
  mutate(url = gsub("c\\(", "", url)) %>% # I don't know how url is a character 
  mutate(url = gsub("NA[,]?", "", url)) %>%
  mutate(url = gsub("\\)", "", url))



links <- tibble(source = '', target = '')
for(i in (1:length(themes$title))) {
  for(j in (1:length(datasets$title))) {
    if(themes$title[i] %in% unlist(datasets$theme[j])) {
      links <- rbind(links, c(themes$id[i], datasets$id[j]))
    }
  }
}

for(i in (1:length(keywords$title))) {
  for(j in (1:length(datasets$title))) {
    if(themes$title[i] %in% unlist(datasets$theme[j])) {
      links <- rbind(links, c(themes$id[i], datasets$id[j]))
    }
  }
}